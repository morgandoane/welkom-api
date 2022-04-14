import { ItineraryStatus } from '@src/schema/Itinerary/ItineraryStatus';
import { OrderModel } from './../Order/Order';
import { UserInputError } from 'apollo-server-errors';
import { CompanyModel } from './../Company/Company';
import { Bol } from './../Bol/Bol';
import { BolModel } from './../Bol/BolModel';
import { Itinerary } from './Itinerary';
import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType, Ref } from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { DateRangeInput } from '../Range/DateRange/DateRangeInput';
import { endOfDay, startOfDay } from 'date-fns';

@InputType()
export class ItineraryFilter extends UploadEnabledFilter {
    @Field({ nullable: true })
    internal?: boolean;

    @Field({ nullable: true })
    carrier?: string;

    @Field({ nullable: true })
    code?: string;

    @Field({ nullable: true })
    order_link?: string | null;

    @Field({ nullable: true })
    bol_number?: string;

    @Field(() => DateRangeInput, { nullable: true })
    stop_date?: DateRangeInput;

    @Field(() => ObjectIdScalar, { nullable: true })
    dropoff_company?: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    pickup_company?: Ref<Company>;

    @Field(() => ItineraryStatus, { nullable: true })
    status?: ItineraryStatus;

    public async serializeItineraryFilter(): Promise<
        FilterQuery<DocumentType<Itinerary>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Itinerary>>;

        if (this.status) query.status = this.status;

        if (this.carrier !== undefined) {
            const potential = await CompanyModel.find({
                name: { $regex: new RegExp(this.carrier, 'i') },
            }).select('_id');
            query.carrier = { $in: potential.map((c) => c._id) };
        }
        if (this.code) query.code = { $regex: new RegExp(this.code, 'i') };
        if (this.order_link !== undefined) {
            const potential = await OrderModel.find({
                po: { $regex: new RegExp(this.order_link, 'i') },
            }).select('_id');
            query.order_link = { $in: potential.map((c) => c._id) };
        }
        if (this.internal) {
            const internalCompany = await CompanyModel.findOne({
                internal: true,
            });

            if (!internalCompany)
                throw new UserInputError(
                    'No internal company has been set up yet.'
                );
            const potentialInternalBols = await BolModel.find({
                ['from.company']: internalCompany._id,
                deleted: false,
            }).select('_id itinerary');

            query.$and = [
                ...(query.$and || []),
                {
                    $or: [
                        { order_link: null },
                        {
                            _id: {
                                $in: potentialInternalBols.map(
                                    (b) => b.itinerary
                                ),
                            },
                        },
                    ],
                },
            ];
        }

        if (
            this.bol_number ||
            this.stop_date ||
            this.dropoff_company ||
            this.pickup_company
        ) {
            const bolQuery: FilterQuery<Bol> = {};

            if (this.bol_number) {
                bolQuery.$and = [
                    ...(bolQuery.$and || []),
                    { code: { $regex: new RegExp(this.bol_number, 'i') } },
                ];
            }

            if (this.stop_date) {
                bolQuery.$and = [
                    ...(bolQuery.$and || []),
                    {
                        ['to.date']: {
                            $gte: startOfDay(this.stop_date.start),
                            $lte: endOfDay(this.stop_date.end),
                        },
                    },
                ];
            }

            if (this.dropoff_company)
                bolQuery.$and = [
                    ...(bolQuery.$and || []),
                    {
                        ['to.company']: this.dropoff_company,
                    },
                ];

            if (this.pickup_company)
                bolQuery.$and = [
                    ...(bolQuery.$and || []),
                    {
                        ['from.company']: this.pickup_company,
                    },
                ];

            const potentialBols = await BolModel.find(bolQuery).select(
                '_id itinerary'
            );

            query._id = { $in: potentialBols.map((b) => b.itinerary) };
        }

        return query;
    }
}

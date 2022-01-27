import { CompanyLoader } from './../Company/Company';
import { loaderResult } from '@src/utils/loaderResult';
import { BaseFilter } from './../Base/BaseFilter';
import { DateRangeInput } from './../DateRange/DateRangeInput';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Itinerary } from './Itinerary';
import { Field, InputType } from 'type-graphql';
import { DocumentType, mongoose } from '@typegoose/typegoose';
import { FilterQuery, ObjectId } from 'mongoose';
import { endOfDay, startOfDay } from 'date-fns';

@InputType()
export class ItineraryFilter extends BaseFilter {
    @Field({ nullable: true })
    code?: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    item?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    order?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    location?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    carrier?: ObjectId;

    @Field(() => DateRangeInput, { nullable: true })
    stop_date?: DateRangeInput;

    public async serializeItineraryFilter(): Promise<
        FilterQuery<DocumentType<Itinerary>>
    > {
        const query = this.serializeBaseFilter() as FilterQuery<
            DocumentType<Itinerary>
        >;

        if (this.item) {
            query['bols.content.item'] = this.item;
        }

        if (this.carrier) {
            const carrier = loaderResult(
                await CompanyLoader.load(this.carrier.toString())
            );
            query.carrier = carrier._id;
        }

        if (this.code) {
            query.code = { $regex: new RegExp(this.code, 'i') };
        }

        if (this.location) {
            query.$or = [
                ...query.$or,
                { ['bols.from.location']: this.item },
                { ['bols.to.location']: this.item },
            ];
        }

        if (this.stop_date) {
            query.$or = [
                ...query.$or,
                {
                    ['bols.from.date']: {
                        $gte: startOfDay(this.stop_date.start),
                        $lte: endOfDay(this.stop_date.end),
                    },
                },
                {
                    ['bols.to.date']: {
                        $gte: startOfDay(this.stop_date.start),
                        $lte: endOfDay(this.stop_date.end),
                    },
                },
            ];
        }

        if (this.order) {
            query.orders = new mongoose.Types.ObjectId(this.order.toString());
        }

        return query;
    }
}

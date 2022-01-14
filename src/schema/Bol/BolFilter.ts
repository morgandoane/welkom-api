import {
    VerificationStatus,
    VerificationModel,
} from './../Verification/Verification';
import { ItineraryModel } from './../Itinerary/Itinerary';
import { OrderModel } from './../Order/Order';
import { ItemLoader } from './../Item/Item';
import { BaseFilter } from './../Base/BaseFilter';
import { Bol, BolStatus } from './Bol';
import { DateRangeInput } from './../DateRange/DateRangeInput';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { FilterQuery, ObjectId } from 'mongoose';
import { Field, InputType } from 'type-graphql';
import { DocumentType, mongoose } from '@typegoose/typegoose';
import { endOfDay, startOfDay } from 'date-fns';
import { loaderResult } from '@src/utils/loaderResult';
import { FulfillmentModel } from '../Fulfillment/Fulfillment';

@InputType()
export class BolFilter extends BaseFilter {
    @Field({ nullable: true }) code?: string;

    @Field({ nullable: true }) order_code?: string;

    @Field(() => ObjectIdScalar, { nullable: true }) order?: ObjectId;

    @Field(() => BolStatus, { nullable: true }) status?: BolStatus;

    @Field(() => ObjectIdScalar, { nullable: true })
    from_location?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    to_location?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    from_company?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    to_company?: ObjectId;

    @Field({ nullable: true })
    scheduled_dropoff_date?: DateRangeInput;

    @Field({ nullable: true })
    scheduled_pickup_date?: DateRangeInput;

    @Field(() => ObjectIdScalar, { nullable: true })
    item?: ObjectId;

    @Field({ nullable: true })
    fulfilled_by?: string;

    @Field(() => VerificationStatus, { nullable: true })
    verification_status?: VerificationStatus;

    public async serializeBolFilter(): Promise<FilterQuery<DocumentType<Bol>>> {
        const base = this.serializeBaseFilter();
        const res = { ...base } as FilterQuery<DocumentType<Bol>>;
        if (this.order)
            res.order = new mongoose.Types.ObjectId(this.order.toString());
        if (this.code) res.code = { $regex: new RegExp(this.code, 'i') };
        if (this.status) res.status = this.status;
        if (this.from_company)
            res['from.company'] = new mongoose.Types.ObjectId(
                this.from_company.toString()
            );
        if (this.to_company)
            res['to.company'] = new mongoose.Types.ObjectId(
                this.to_company.toString()
            );
        if (this.from_location)
            res['from.location'] = new mongoose.Types.ObjectId(
                this.from_location.toString()
            );
        if (this.to_location)
            res['to.location'] = new mongoose.Types.ObjectId(
                this.to_location.toString()
            );

        if (this.scheduled_pickup_date) {
            res['from.date'] = {
                $gte: startOfDay(this.scheduled_pickup_date.start),
                $lte: endOfDay(this.scheduled_pickup_date.end),
            };
        }

        if (this.scheduled_dropoff_date) {
            res['to.date'] = {
                $gte: startOfDay(this.scheduled_dropoff_date.start),
                $lte: endOfDay(this.scheduled_dropoff_date.end),
            };
        }

        if (this.item) {
            const item = loaderResult(
                await ItemLoader.load(this.item.toString())
            );

            res['contents.item'] = item._id;
        }

        if (this.order_code) {
            const orders = await OrderModel.find({
                code: { $regex: new RegExp(this.order_code, 'i') },
                deleted: false,
            });

            const itineraries = await ItineraryModel.find({
                deleted: false,
                orders: { $elemMatch: { $in: orders.map((m) => m._id) } },
            });

            res.itinerary = { $in: itineraries.map((i) => i._id) };
        }

        if (this.verification_status !== undefined) {
            if (this.verification_status == null) {
                const invalidFulfillments = await FulfillmentModel.find({
                    deleted: false,
                    verification: { $exists: true },
                });

                res._id = {
                    $nin: invalidFulfillments.map(
                        (f) => new mongoose.Types.ObjectId(f.bol.toString())
                    ),
                };
            } else {
                const options = await VerificationModel.find(
                    {
                        deleted: false,
                        status: this.verification_status,
                    },
                    { _id: 1 }
                );

                const validFulfillments = await FulfillmentModel.find(
                    {
                        deleted: false,
                        verification: { $in: options.map((o) => o._id) },
                    },
                    { bol: 1 }
                );

                res._id = {
                    $in: validFulfillments.map(
                        (f) => new mongoose.Types.ObjectId(f.bol.toString())
                    ),
                };
            }
        }

        if (this.fulfilled_by) {
            const validFulfillments = await FulfillmentModel.find({
                deleted: false,
                created_by: this.fulfilled_by,
            });

            res.$and = [
                ...(res.$and || []),
                {
                    _id: {
                        $in: validFulfillments.map(
                            (f) => new mongoose.Types.ObjectId(f.bol.toString())
                        ),
                    },
                },
            ];
        }

        return res;
    }
}

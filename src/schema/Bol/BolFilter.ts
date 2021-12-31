import { BaseFilter } from './../Base/BaseFilter';
import { Bol, BolStatus } from './Bol';
import { DateRangeInput } from './../DateRange/DateRangeInput';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { FilterQuery, ObjectId } from 'mongoose';
import { Field, InputType } from 'type-graphql';
import { DocumentType, mongoose } from '@typegoose/typegoose';
import { endOfDay, startOfDay } from 'date-fns';
import { loaderResult } from '@src/utils/loaderResult';
import { OrderLoader } from '../Order/Order';

@InputType()
export class BolFilter extends BaseFilter {
    @Field({ nullable: true }) code?: string;

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

        return res;
    }
}

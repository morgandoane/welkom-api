import { BaseFilter } from './../Base/BaseFilter';
import { Order } from './Order';
import { DateRangeInput } from './../DateRange/DateRangeInput';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { FilterQuery, ObjectId } from 'mongoose';
import { Field, InputType } from 'type-graphql';
import { DocumentType } from '@typegoose/typegoose';
import { endOfDay, startOfDay } from 'date-fns';

@InputType()
export class OrderFilter extends BaseFilter {
    @Field(() => ObjectIdScalar, { nullable: true }) customer?: ObjectId;
    @Field(() => ObjectIdScalar, { nullable: true }) vendor?: ObjectId;
    @Field(() => ObjectIdScalar, { nullable: true }) item?: ObjectId;
    @Field(() => DateRangeInput, { nullable: true }) due?: DateRangeInput;

    public serializeOrderFilter(): FilterQuery<DocumentType<Order>> {
        const base = this.serializeBaseFilter();
        const res = { ...base } as FilterQuery<DocumentType<Order>>;
        if (this.customer) res.customer = this.customer.toString();
        if (this.vendor) res.vendor = this.vendor.toString();
        if (this.item) res['contents.item'] = this.item.toString();
        if (this.due)
            res.due = {
                $gte: startOfDay(this.due.start),
                $lte: endOfDay(this.due.end),
            };
        return res;
    }
}

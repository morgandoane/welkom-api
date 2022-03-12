import { startOfDay, endOfDay } from 'date-fns';
import { DateRangeInput } from './../Range/DateRange/DateRangeInput';
import { Order } from './Order';
import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType, Ref } from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Item } from '../Item/Item';

@InputType()
export class OrderFilter extends UploadEnabledFilter {
    @Field({ nullable: true })
    po?: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    customer?: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    vendor?: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    item?: Ref<Item>;

    @Field(() => DateRangeInput, { nullable: true })
    date_range?: DateRangeInput;

    public async serializeOrderFilter(): Promise<
        FilterQuery<DocumentType<Order>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Order>>;

        if (this.po) query.po = { $regex: new RegExp(this.po, 'i') };
        if (this.customer) query.customer = this.customer;
        if (this.vendor) query.vendor = this.vendor;
        if (this.item) query['appointments.contents.item'] = this.item;
        if (this.date_range)
            query['appointments.date'] = {
                $gte: startOfDay(this.date_range.start),
                $lte: endOfDay(this.date_range.end),
            };

        return query;
    }
}

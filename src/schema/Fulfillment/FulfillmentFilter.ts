import { ObjectIdScalar } from './../ObjectIdScalar';
import { ConfiguredFilter } from './../Configured/ConfiguredFilter';
import { Field, InputType } from 'type-graphql';
import { Fulfillment, FulfillmentType } from './Fulfillment';
import { DocumentType, Ref } from '@typegoose/typegoose';
import { FilterQuery, ObjectId } from 'mongoose';
import { Item } from '../Item/Item';

@InputType()
export class FulfillmentFilter extends ConfiguredFilter {
    @Field(() => FulfillmentType, { nullable: true })
    type?: FulfillmentType;

    @Field(() => ObjectIdScalar, { nullable: true })
    location?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    company?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    item?: ObjectId;

    public serializeFulfillmentFilter(): FilterQuery<
        DocumentType<Fulfillment>
    > {
        const query = this.serializeConfiguredFilter() as FilterQuery<
            DocumentType<Fulfillment>
        >;

        if (this.type) query.type = this.type;
        if (this.location) query.location = this.location.toString();
        if (this.company) query.company = this.company.toString();
        if (this.item) query.items = this.item.toString() as any;

        return query;
    }
}

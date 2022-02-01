import { Fulfillment } from './Fulfillment';
import { UploadEnabledFilter } from './../UploadEnabled/UploadEnabledFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType, Ref } from '@typegoose/typegoose';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Bol } from '../Bol/Bol';

@InputType()
export class FulfillmentFilter extends UploadEnabledFilter {
    @Field(() => ObjectIdScalar, { nullable: true })
    bol?: Ref<Bol>;

    public async serializeFulfillmentFilter(): Promise<
        FilterQuery<DocumentType<Fulfillment>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Fulfillment>>;

        if (this.bol) query.bol = this.bol;

        return query;
    }
}

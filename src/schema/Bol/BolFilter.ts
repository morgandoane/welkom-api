import { Item } from '@src/schema/Item/Item';
import { Bol } from './Bol';
import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType, Ref } from '@typegoose/typegoose';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Itinerary } from '../Itinerary/Itinerary';

@InputType()
export class BolFilter extends UploadEnabledFilter {
    @Field(() => ObjectIdScalar, { nullable: true })
    itinerary?: Ref<Itinerary>;

    @Field(() => ObjectIdScalar, { nullable: true })
    item?: Ref<Item>;

    @Field({ nullable: true })
    code?: string;

    public async serializeBolFilter(): Promise<FilterQuery<DocumentType<Bol>>> {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Bol>>;

        if (this.itinerary) query.itinerary = this.itinerary;
        if (this.code) query.code = { $regex: new RegExp(this.code, 'i') };
        if (this.item) query['contents.item'] = this.item;

        return query;
    }
}

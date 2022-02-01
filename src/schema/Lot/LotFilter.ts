import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType, Ref } from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Lot } from './Lot';
import { Item } from '../Item/Item';

@InputType()
export class LotFilter extends UploadEnabledFilter {
    @Field({ nullable: true })
    code?: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    item?: Ref<Item>;

    @Field(() => ObjectIdScalar, { nullable: true })
    company?: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    location?: Ref<Location> | null;

    public async serializeLotFilter(): Promise<FilterQuery<DocumentType<Lot>>> {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Lot>>;

        if (this.code) query.code = { $regex: new RegExp(this.code, 'i') };
        if (this.item) query.item = this.item;
        if (this.company) query.company = this.company;
        if (this.location) query.location = this.location;

        return query;
    }
}

import { Item } from '@src/schema/Item/Item';
import { Bol } from './Bol';
import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType, Ref } from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Itinerary } from '../Itinerary/Itinerary';
import { Location } from '../Location/Location';

@InputType()
export class BolFilter extends UploadEnabledFilter {
    @Field(() => ObjectIdScalar, { nullable: true })
    itinerary?: Ref<Itinerary>;

    @Field(() => ObjectIdScalar, { nullable: true })
    item?: Ref<Item>;

    @Field({ nullable: true })
    code?: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    from_company?: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    to_company?: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    from_location?: Ref<Location>;

    @Field(() => ObjectIdScalar, { nullable: true })
    to_location?: Ref<Location>;

    public async serializeBolFilter(): Promise<FilterQuery<DocumentType<Bol>>> {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Bol>>;

        if (this.itinerary) query.itinerary = this.itinerary;
        if (this.code) query.code = { $regex: new RegExp(this.code, 'i') };
        if (this.from_company) query['from.company'] = this.from_company;
        if (this.to_company) query['to.company'] = this.to_company;
        if (this.from_location) query['from.location'] = this.from_location;
        if (this.to_location) query['to.location'] = this.to_location;
        if (this.to_location) query['to.location'] = this.to_location;
        if (this.item) query['contents.item'] = this.item;

        return query;
    }
}

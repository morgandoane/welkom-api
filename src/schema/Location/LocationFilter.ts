import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType, Ref } from '@typegoose/typegoose';
import { Location } from './Location';
import { Company } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';

@InputType()
export class LocationFilter extends UploadEnabledFilter {
    @Field(() => ObjectIdScalar, { nullable: true })
    company?: Ref<Company>;

    @Field({ nullable: true })
    label?: string;

    public async serializeLocationFilter(): Promise<
        FilterQuery<DocumentType<Location>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Location>>;

        if (this.company) query.company = this.company;
        if (this.label)
            query.$or = [
                ...(query.$or || []),
                { label: { $regex: new RegExp(this.label, 'i') } },
                { ['address.city']: { $regex: new RegExp(this.label, 'i') } },
            ];

        return query;
    }
}

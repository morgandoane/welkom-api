import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { Company } from './Company';

@InputType()
export class CompanyFilter extends UploadEnabledFilter {
    @Field({ nullable: true })
    name?: string;

    public async serializeCompanyFilter(): Promise<
        FilterQuery<DocumentType<Company>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Company>>;

        if (this.name) query.name = { $regex: new RegExp(this.name, 'i') };

        return query;
    }
}

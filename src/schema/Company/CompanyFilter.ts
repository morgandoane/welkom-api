import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { Company } from './Company';

@InputType()
export class CompanyFilter extends UploadEnabledFilter {
    public async serializeCompanyFilter(): Promise<
        FilterQuery<DocumentType<Company>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Company>>;

        return query;
    }
}

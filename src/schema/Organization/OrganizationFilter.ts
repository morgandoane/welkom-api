import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { Organization } from './Organization';

@InputType()
export class OrganizationFilter extends UploadEnabledFilter {
    public async serializeOrganizationFilter(): Promise<
        FilterQuery<DocumentType<Organization>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Organization>>;

        return query;
    }
}

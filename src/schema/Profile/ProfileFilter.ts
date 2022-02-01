import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { Profile } from './Profile';

@InputType()
export class ProfileFilter extends UploadEnabledFilter {
    public async serializeProfileFilter(): Promise<
        FilterQuery<DocumentType<Profile>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Profile>>;

        return query;
    }
}

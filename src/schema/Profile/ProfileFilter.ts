import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { InputType, Field } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { Profile } from './Profile';

@InputType()
export class ProfileFilter extends UploadEnabledFilter {
    @Field(() => [String], { nullable: true })
    ids?: string[];
    public async serializeProfileFilter(): Promise<
        FilterQuery<DocumentType<Profile>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Profile>>;

        if (this.ids) query.user_id = { $in: this.ids };

        return query;
    }
}

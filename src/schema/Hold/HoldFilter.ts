import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { Hold } from './Hold';

@InputType()
export class HoldFilter extends UploadEnabledFilter {
    public async serializeHoldFilter(): Promise<
        FilterQuery<DocumentType<Hold>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Hold>>;

        return query;
    }
}

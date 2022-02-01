import { BaseFilter } from './../Base/BaseFilter';
import { Field, InputType } from 'type-graphql';
import { DocumentType } from '@typegoose/typegoose';
import { FilterQuery } from 'mongoose';
import { UploadEnabled } from './UploadEnabled';

@InputType()
export class UploadEnabledFilter extends BaseFilter {
    public async serializeUploadEnabledFilter(): Promise<
        FilterQuery<DocumentType<UploadEnabled>>
    > {
        const query: FilterQuery<DocumentType<UploadEnabled>> = {
            ...(await this.serializeBaseFilter()),
        };

        return query;
    }
}

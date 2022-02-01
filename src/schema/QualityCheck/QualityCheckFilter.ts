import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { QualityCheck } from './QualityCheck';

@InputType()
export class QualityCheckFilter extends UploadEnabledFilter {
    public async serializeQualityCheckFilter(): Promise<
        FilterQuery<DocumentType<QualityCheck>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<QualityCheck>>;

        return query;
    }
}

import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { ProductionLine } from './ProductionLine';

@InputType()
export class ProductionLineFilter extends UploadEnabledFilter {
    public async serializeProductionLineFilter(): Promise<
        FilterQuery<DocumentType<ProductionLine>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<ProductionLine>>;

        return query;
    }
}

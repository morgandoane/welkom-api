import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { Unit } from './Unit';

@InputType()
export class UnitFilter extends UploadEnabledFilter {
    public async serializeUnitFilter(): Promise<
        FilterQuery<DocumentType<Unit>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Unit>>;

        return query;
    }
}

import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { Recipe } from './Recipe';

@InputType()
export class RecipeFilter extends UploadEnabledFilter {
    public async serializeRecipeFilter(): Promise<
        FilterQuery<DocumentType<Recipe>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Recipe>>;

        return query;
    }
}

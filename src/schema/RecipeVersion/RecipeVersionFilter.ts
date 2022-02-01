import { BaseFilter } from './../Base/BaseFilter';
import { InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType } from '@typegoose/typegoose';
import { RecipeVersion } from './RecipeVersion';

@InputType()
export class RecipeVersionFilter extends BaseFilter {
    public async serializeRecipeVersionFilter(): Promise<
        FilterQuery<DocumentType<RecipeVersion>>
    > {
        const query = {
            ...(await this.serializeBaseFilter()),
        } as FilterQuery<DocumentType<RecipeVersion>>;

        return query;
    }
}

import { ObjectIdScalar } from './../ObjectIdScalar';
import { RecipeLoader } from './../Recipe/Recipe';
import { loaderResult } from './../../utils/loaderResult';
import { RecipeVersion } from './RecipeVersion';
import { BaseFilter } from './../Base/BaseFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery, ObjectId } from 'mongoose';
import { DocumentType, mongoose } from '@typegoose/typegoose';

@InputType()
export class RecipeVersionFilter extends BaseFilter {
    @Field(() => [String], { nullable: true })
    items?: string[];

    @Field(() => ObjectIdScalar, { nullable: true })
    recipe?: ObjectId;

    public async serializeVersionFilter(): Promise<
        FilterQuery<DocumentType<RecipeVersion>>
    > {
        const query: FilterQuery<DocumentType<RecipeVersion>> = {
            ...(this.serializeBaseFilter() as FilterQuery<
                DocumentType<RecipeVersion>
            >),
        };

        if (this.items) {
            query['sections.steps.content.item'] = {
                $in: this.items.map((i) => new mongoose.Types.ObjectId(i)),
            };
        }

        if (this.recipe) {
            const recipe = loaderResult(
                await RecipeLoader.load(this.recipe.toString())
            );
            query.recipe = recipe._id;
        }

        return query;
    }
}

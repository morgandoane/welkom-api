import { UserInputError } from 'apollo-server-errors';
import { RecipeLoader } from './../Recipe/Recipe';
import { RecipeVersionLoader } from './../RecipeVersion/RecipeVersion';
import { mongoose } from '@typegoose/typegoose';
import { loaderResult } from './../../utils/loaderResult';
import { Field, ID, InputType } from 'type-graphql';
import { MixingCardLine } from './MixingCardLine';

@InputType()
export class MixingCardLineInput {
    @Field()
    recipe!: string;

    @Field({ nullable: true })
    recipe_version?: string;

    @Field({ nullable: true })
    limit?: number;

    public async validateLine(): Promise<MixingCardLine> {
        if (this.recipe_version) {
            const recipe = loaderResult(await RecipeLoader.load(this.recipe));

            const version = loaderResult(
                await RecipeVersionLoader.load(this.recipe_version)
            );

            if (recipe._id.toString() !== version.recipe.toString())
                throw new UserInputError('Version does not match recipe.');

            return {
                _id: new mongoose.Types.ObjectId(),
                limit: this.limit,
                recipe_version: version._id,
                recipe: recipe._id,
            };
        } else {
            const recipe = loaderResult(await RecipeLoader.load(this.recipe));

            return {
                _id: new mongoose.Types.ObjectId(),
                limit: this.limit,
                recipe: recipe._id,
            };
        }
    }
}

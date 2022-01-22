import { Recipe, RecipeLoader } from './../Recipe/Recipe';
import {
    RecipeVersion,
    RecipeVersionLoader,
} from './../RecipeVersion/RecipeVersion';
import { loaderResult } from './../../utils/loaderResult';
import { MixingCardLine } from './MixingCardLine';
import { FieldResolver, Resolver, ResolverInterface, Root } from 'type-graphql';

@Resolver(() => MixingCardLine)
export class MixingCardLineResolvers
    implements ResolverInterface<MixingCardLine>
{
    @FieldResolver(() => RecipeVersion, { nullable: true })
    async recipe_version(
        @Root() { recipe_version }: MixingCardLine
    ): Promise<RecipeVersion> {
        if (!recipe_version) return null;
        else
            return loaderResult(
                await RecipeVersionLoader.load(recipe_version.toString())
            );
    }

    @FieldResolver(() => Recipe)
    async recipe(@Root() { recipe }: MixingCardLine): Promise<Recipe> {
        return loaderResult(await RecipeLoader.load(recipe.toString()));
    }
}

import { Recipe, RecipeLoader } from './../Recipe/Recipe';
import { Context } from './../../auth/context';
import { RecipeVersionFilter } from './RecipeVersionFilter';
import { Paginate } from './../Paginate';
import { RecipeVersionList } from './RecipeVersionList';
import { loaderResult } from './../../utils/loaderResult';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { Permitted } from '@src/auth/middleware/Permitted';
import {
    RecipeVersion,
    RecipeVersionLoader,
    RecipeVersionModel,
} from './RecipeVersion';
import { createBaseResolver } from './../Base/BaseResolvers';
import {
    Arg,
    Ctx,
    Query,
    Resolver,
    UseMiddleware,
    Mutation,
    FieldResolver,
    Root,
} from 'type-graphql';
import { Permission } from '@src/auth/permissions';
import { RecipeVersionInput } from './RecipeVersionInput';

export const BaseResolver = createBaseResolver();

@Resolver(() => RecipeVersion)
export class RecipeVersionResolvers extends BaseResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetRecipes })
    )
    @Query(() => RecipeVersion)
    async recipeVersion(
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<RecipeVersion> {
        return loaderResult(await RecipeVersionLoader.load(id.toString()));
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetRecipes })
    )
    @Query(() => RecipeVersionList)
    async recipeVersions(
        @Arg('filter', () => RecipeVersionFilter) filter: RecipeVersionFilter
    ): Promise<RecipeVersionList> {
        return await Paginate.paginate({
            model: RecipeVersionModel,
            query: await filter.serializeVersionFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateRecipe })
    )
    @Mutation(() => RecipeVersion)
    async createRecipeVersion(
        @Ctx() context: Context,
        @Arg('data', () => RecipeVersionInput) data: RecipeVersionInput
    ): Promise<RecipeVersion> {
        const doc = await data.validateRecipeVersion(context);
        const res = await RecipeVersionModel.create(doc);
        RecipeLoader.clear(data.recipe.toString());
        return res.toJSON();
    }

    @FieldResolver(() => Recipe)
    async recipe(@Root() { recipe }: RecipeVersion): Promise<Recipe> {
        return loaderResult(await RecipeLoader.load(recipe.toString()));
    }
}

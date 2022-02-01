import { RecipeLoader } from './../Recipe/Recipe';
import { UpdateRecipeVersionInput } from './UpdateRecipeVersionInput';
import { RecipeVersionFilter } from './RecipeVersionFilter';
import { RecipeVersionList } from './RecipeVersionList';
import { Paginate } from '../Pagination/Pagination';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { createUploadEnabledResolver } from '../UploadEnabled/UploadEnabledResolvers';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import {
    RecipeVersion,
    RecipeVersionLoader,
    RecipeVersionModel,
} from './RecipeVersion';
import { CreateRecipeVersionInput } from './CreateRecipeVersionInput';
import { Recipe } from '../Recipe/Recipe';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => RecipeVersion)
export class RecipeVersionResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetRecipes,
        })
    )
    @Query(() => RecipeVersionList)
    async recipeVersions(
        @Arg('filter') filter: RecipeVersionFilter
    ): Promise<RecipeVersionList> {
        return await Paginate.paginate({
            model: RecipeVersionModel,
            query: await filter.serializeRecipeVersionFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetRecipes,
        })
    )
    @Query(() => RecipeVersion)
    async recipeVersion(
        @Arg('id', () => ObjectIdScalar) id: Ref<RecipeVersion>
    ): Promise<RecipeVersion> {
        return await RecipeVersionLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateRecipe,
        })
    )
    @Mutation(() => RecipeVersion)
    async createRecipeVersion(
        @Ctx() context: Context,
        @Arg('data', () => CreateRecipeVersionInput)
        data: CreateRecipeVersionInput
    ): Promise<RecipeVersion> {
        const recipeVersion = await data.validateRecipeVersion(context);
        const res = await RecipeVersionModel.create(recipeVersion);
        return res;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateRecipe,
        })
    )
    @Mutation(() => RecipeVersion)
    async updateRecipeVersion(
        @Arg('id', () => ObjectIdScalar) id: Ref<RecipeVersion>,
        @Arg('data', () => UpdateRecipeVersionInput)
        data: UpdateRecipeVersionInput
    ): Promise<RecipeVersion> {
        const res = await RecipeVersionModel.findByIdAndUpdate(
            id,
            await data.serializeRecipeVersionUpdate(),
            { new: true }
        );

        RecipeVersionLoader.clear(id);

        return res;
    }

    @FieldResolver(() => Recipe)
    async recipe(@Root() { recipe }: RecipeVersion): Promise<Recipe> {
        return await RecipeLoader.load(recipe, true);
    }
}

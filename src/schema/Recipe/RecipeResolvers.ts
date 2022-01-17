import { Folder, FolderLoader } from './../Folder/Folder';
import { ItemLoader } from './../Item/Item';
import { Item } from '@src/schema/Item/Item';
import { Context } from './../../auth/context';
import { CreateRecipeInput, UpdateRecipeInput } from './RecipeInputs';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Paginate } from './../Paginate';
import { RecipeFilter } from './RecipeFilter';
import { RecipeList } from './RecipeList';
import { loaderResult } from './../../utils/loaderResult';
import { ObjectId } from 'mongoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Recipe, RecipeLoader, RecipeModel } from './Recipe';
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
import { createBaseResolver } from './../Base/BaseResolvers';
import { Permission } from '@src/auth/permissions';

const BaseResolver = createBaseResolver();

@Resolver(() => Recipe)
export class RecipeResolvers extends BaseResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetRecipes })
    )
    @Query(() => Recipe)
    async recipe(
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<Recipe> {
        return loaderResult(await RecipeLoader.load(id.toString()));
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetRecipes })
    )
    @Query(() => RecipeList)
    async recipes(
        @Arg('filter', () => RecipeFilter) filter: RecipeFilter
    ): Promise<RecipeList> {
        return await Paginate.paginate({
            model: RecipeModel,
            query: await filter.serialize(),
            skip: filter.skip,
            take: filter.take,
            sort: { name: 1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateRecipe })
    )
    @Mutation(() => Recipe)
    async createRecipe(
        @Ctx() context: Context,
        @Arg('data', () => CreateRecipeInput) data: CreateRecipeInput
    ): Promise<Recipe> {
        const doc = await data.validateRecipeInput(context);
        const res = await RecipeModel.create(doc);
        return res.toJSON();
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateRecipe })
    )
    @Mutation(() => Recipe)
    async updateRecipe(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data', () => UpdateRecipeInput) data: UpdateRecipeInput
    ): Promise<Recipe> {
        const update = await data.validateRecipeUpdate(context);
        const res = await RecipeModel.findByIdAndUpdate(id.toString(), update, {
            new: true,
        });
        RecipeLoader.clear(id.toString());
        return res.toJSON();
    }

    @FieldResolver(() => Item)
    async item(@Root() { item }: Recipe): Promise<Item> {
        return loaderResult(await ItemLoader.load(item.toString()));
    }

    @FieldResolver(() => Folder)
    async folder(
        @Ctx() context: Context,
        @Root() { folder }: Recipe
    ): Promise<Folder> {
        if (!folder) return Folder.fromNull(context);
        return loaderResult(await FolderLoader.load(folder.toString()));
    }
}

import { Folder, FolderClass, FolderLoader } from './../Folder/Folder';
import { Item, ItemLoader } from '@src/schema/Item/Item';
import { UpdateRecipeInput } from './UpdateRecipeInput';
import { RecipeFilter } from './RecipeFilter';
import { RecipeList } from './RecipeList';
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
import { Recipe, RecipeLoader, RecipeModel } from './Recipe';
import { CreateRecipeInput } from './CreateRecipeInput';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Recipe)
export class RecipeResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetRecipes })
    )
    @Query(() => RecipeList)
    async recipes(@Arg('filter') filter: RecipeFilter): Promise<RecipeList> {
        return await Paginate.paginate({
            model: RecipeModel,
            query: await filter.serializeRecipeFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetRecipes })
    )
    @Query(() => Recipe)
    async recipe(
        @Arg('id', () => ObjectIdScalar) id: Ref<Recipe>
    ): Promise<Recipe> {
        return await RecipeLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateRecipe })
    )
    @Mutation(() => Recipe)
    async createRecipe(
        @Ctx() context: Context,
        @Arg('data', () => CreateRecipeInput) data: CreateRecipeInput
    ): Promise<Recipe> {
        const recipe = await data.validateRecipe(context);
        const res = await RecipeModel.create(recipe);
        return res;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateRecipe })
    )
    @Mutation(() => Recipe)
    async updateRecipe(
        @Arg('id', () => ObjectIdScalar) id: Ref<Recipe>,
        @Arg('data', () => UpdateRecipeInput) data: UpdateRecipeInput
    ): Promise<Recipe> {
        const res = await RecipeModel.findByIdAndUpdate(
            id,
            await data.serializeRecipeUpdate(),
            { new: true }
        );

        RecipeLoader.clear(id);

        return res;
    }

    @FieldResolver(() => Item)
    async item(@Root() { item }: Recipe): Promise<Item> {
        return await ItemLoader.load(item, true);
    }

    @FieldResolver(() => Folder)
    async folder(
        @Ctx() context: Context,
        @Root() { folder }: Recipe
    ): Promise<Folder> {
        if (!folder) return Folder.fromNull(context, FolderClass.Recipe);
        else return await FolderLoader.load(folder, true);
    }
}

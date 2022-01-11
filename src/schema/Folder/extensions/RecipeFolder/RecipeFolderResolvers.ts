import { Recipe, RecipeModel } from './../../../Recipe/Recipe';
import { MoveFolderResult } from './../../MoveFolderResult';
import {
    RecipeFolderInput,
    UpdateRecipeFolderInput,
} from './RecipeFolderInput';
import { createBaseResolver } from './../../../Base/BaseResolvers';
import {
    RecipeFolder,
    RecipeFolderModel,
    RecipeFolderLoader,
} from './RecipeFolder';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { Context } from '@src/auth/context';
import { mongoose } from '@typegoose/typegoose';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { loaderResult } from '@src/utils/loaderResult';
import { UserInputError } from 'apollo-server-errors';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';

const BaseResolvers = createBaseResolver();

@ObjectType()
export class MoveRecipeFolderResult extends MoveFolderResult(RecipeFolder) {}

@Resolver(() => RecipeFolder)
export class RecipeFolderResolvers extends BaseResolvers {
    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetRecipeFolders,
        })
    )
    @Query(() => RecipeFolder)
    async recipeFolder(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar, { nullable: true })
        id: ObjectId | null
    ): Promise<RecipeFolder> {
        if (!id) return RecipeFolder.fromNull(context);
        else return loaderResult(await RecipeFolderLoader.load(id.toString()));
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateRecipeFolder,
        })
    )
    @Mutation(() => RecipeFolder)
    async createRecipeFolder(
        @Ctx() { base }: Context,
        @Arg('data') data: RecipeFolderInput
    ): Promise<RecipeFolder> {
        const doc: RecipeFolder = {
            ...base,
            ...data,
            parent: data.parent
                ? new mongoose.Types.ObjectId(data.parent.toString())
                : null,
        };

        const res = await RecipeFolderModel.create(doc);

        return res;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateRecipeFolder,
        })
    )
    @Mutation(() => RecipeFolder)
    async updateFolder(
        @Ctx() { base }: Context,
        @Arg('id') id: string,
        @Arg('data') data: UpdateRecipeFolderInput
    ): Promise<RecipeFolder> {
        return await RecipeFolderModel.findByIdAndUpdate(
            id,
            {
                ...data,
                modified_by: base.modified_by,
                date_modified: base.date_modified,
            },
            {
                new: true,
            }
        );
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateRecipeFolder,
        })
    )
    @Mutation(() => MoveRecipeFolderResult)
    async moveRecipeFolder(
        @Ctx() { base }: Context,
        @Arg('folder', () => ObjectIdScalar) folder: ObjectId,
        @Arg('destination', () => ObjectIdScalar, { nullable: true })
        destination?: ObjectId | null
    ): Promise<MoveRecipeFolderResult> {
        const doc = loaderResult(
            await RecipeFolderLoader.load(folder.toString())
        );
        const origin = doc.parent || null;
        const newParent = !destination
            ? null
            : loaderResult(
                  await RecipeFolderLoader.load(destination.toString())
              );

        if (newParent && doc && newParent.class !== doc.class)
            throw new UserInputError('Mismatch in folder class.');

        doc.parent = newParent ? newParent._id : null;
        doc.date_modified = base.date_modified;
        doc.modified_by = base.modified_by;

        if (newParent) RecipeFolderLoader.clear(newParent._id.toString());
        await doc.save();

        return {
            origin: origin
                ? loaderResult(await RecipeFolderLoader.load(origin.toString()))
                : null,
            destination: destination
                ? loaderResult(
                      await RecipeFolderLoader.load(destination.toString())
                  )
                : null,
        };
    }

    @FieldResolver(() => RecipeFolder, { nullable: true })
    async parent(@Root() { parent }: RecipeFolder): Promise<RecipeFolder> {
        if (!parent) return null;
        else
            return loaderResult(
                await RecipeFolderLoader.load(parent.toString())
            );
    }

    @FieldResolver(() => [RecipeFolder], { nullable: true })
    async folders(
        @Root() { _id: parent }: RecipeFolder
    ): Promise<RecipeFolder[]> {
        return await RecipeFolderModel.find({ deleted: false, parent });
    }

    @FieldResolver(() => [Recipe], { nullable: true })
    async recipes(@Root() { _id, name }: RecipeFolder): Promise<Recipe[]> {
        if (name == 'Home')
            return await RecipeModel.find({
                deleted: false,
                $or: [{ folder: { $exists: false } }, { folder: null }],
            });
        else return await RecipeModel.find({ deleted: false, folder: _id });
    }
}

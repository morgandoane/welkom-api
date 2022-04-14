import { ObjectId } from 'mongoose';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Context } from './../../auth/context';
import { Recipe, RecipeModel } from './../Recipe/Recipe';
import { loaderResult } from './../../utils/loaderResult';
import { createBaseResolver } from './../Base/BaseResolvers';
import { Folder, FolderModel, FolderLoader } from './Folder';
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
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '../ObjectIdScalar';
import { CreateFolderInput, UpdateFolderInput } from './FolderInput';

const BaseResolvers = createBaseResolver();

@Resolver(() => Folder)
export class FolderResolvers extends BaseResolvers {
    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetRecipeFolders,
        })
    )
    @Query(() => Folder)
    async folder(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar, { nullable: true }) id: ObjectId | null
    ): Promise<Folder> {
        if (!id) return Folder.fromNull(context);
        const doc = await FolderModel.findById(id.toString());
        return doc.toJSON() as unknown as Folder;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateRecipeFolder,
        })
    )
    @Mutation(() => Folder)
    async createFolder(
        @Ctx() context: Context,
        @Arg('data', () => CreateFolderInput) data: CreateFolderInput
    ): Promise<Folder> {
        const doc = await data.validate(context);
        const res = await FolderModel.create(doc);
        return res.toJSON() as unknown as Folder;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.UpdateRecipeFolder,
        })
    )
    @Mutation(() => Folder)
    async updateFolder(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data', () => UpdateFolderInput) data: UpdateFolderInput
    ): Promise<Folder> {
        const update = await data.serializeFolderUpdate(context);
        const res = await FolderModel.findByIdAndUpdate(id.toString(), update, {
            new: true,
        });

        FolderLoader.clearAll();

        return res.toJSON() as unknown as Folder;
    }

    @FieldResolver(() => Folder)
    async parent(@Root() { parent }: Folder): Promise<Folder> {
        if (!parent) return null;
        return loaderResult(await FolderLoader.load(parent.toString()));
    }

    @FieldResolver(() => [Recipe])
    async recipes(@Root() { _id, name }: Folder): Promise<Recipe[]> {
        const res = await RecipeModel.find({
            deleted: false,
            folder: name == 'Home' ? null : _id,
        }).sort({ name: 1 });

        return res.map((r) => r.toJSON() as unknown as Recipe);
    }

    @FieldResolver(() => [Folder])
    async folders(@Root() { _id, name }: Folder): Promise<Folder[]> {
        const res = await FolderModel.find({
            deleted: false,
            parent: name == 'Home' ? null : _id,
        }).sort({ name: 1 });

        return res.map((r) => r.toJSON() as unknown as Folder);
    }

    @FieldResolver(() => [Folder])
    async ancestry(
        @Ctx() context: Context,
        @Root() folder: Folder
    ): Promise<Folder[]> {
        if (folder.name == 'Home') return [];

        if (!folder.parent) return [Folder.fromNull(context)];

        const loop = async (
            folder: Folder,
            stack: Folder[]
        ): Promise<Folder[]> => {
            const { parent } = folder;
            if (!parent) return [Folder.fromNull(context)];
            else {
                const parentDoc = await FolderModel.findById(parent.toString());
                return [...(await loop(parentDoc, stack)), parentDoc, ...stack];
            }
        };

        return loop(folder, []);
    }
}

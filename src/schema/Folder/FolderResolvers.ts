import { Paginate } from '../Pagination/Pagination';
import { FolderFilter } from './FolderFilter';
import { FolderList } from './FolderList';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { CreateFolderInput } from './CreateFolderInput';
import { CompanyLoader } from '../Company/Company';
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
import { Folder, FolderModel, FolderLoader } from './Folder';
import { Company } from '../Company/Company';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { UpdateFolderInput } from './UpdateFolderInput';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Folder)
export class FolderResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetFolders })
    )
    @Query(() => FolderList)
    async folders(@Arg('filter') filter: FolderFilter): Promise<FolderList> {
        return await Paginate.paginate({
            model: FolderModel,
            query: await filter.serializeFolderFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetFolders })
    )
    @Query(() => Folder)
    async folder(
        @Arg('id', () => ObjectIdScalar) id: Ref<Folder>
    ): Promise<Folder> {
        return await FolderLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateFolder })
    )
    @Mutation(() => Folder)
    async createFolder(
        @Ctx() context: Context,
        @Arg('data', () => CreateFolderInput) data: CreateFolderInput
    ): Promise<Folder> {
        const doc = await data.validateFolder(context);
        const res = await FolderModel.create(doc);
        return res;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateFolder })
    )
    @Mutation(() => Folder)
    async updateFolder(
        @Arg('id', () => ObjectIdScalar) id: Ref<Folder>,
        @Arg('data', () => UpdateFolderInput) data: UpdateFolderInput
    ): Promise<Folder> {
        const res = await FolderModel.findByIdAndUpdate(
            id,
            await data.serializeFolder(),
            { new: true }
        );

        return res;
    }

    @FieldResolver(() => Folder)
    async parent(
        @Ctx() context: Context,
        @Root() { parent, class: folder_class }: Folder
    ): Promise<Folder> {
        if (!parent) return Folder.fromNull(context, folder_class);
        else return await FolderLoader.load(parent, true);
    }
}

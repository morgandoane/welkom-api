import { DocumentAi } from './../../services/CloudStorage/DocumentAi';
import { DeleteFileArgs } from './DeleteFileArgs';
import { StorageBucket } from '@src/services/CloudStorage/CloudStorage';
import { Context } from '@src/auth/context';
import { UserLoader } from '@src/services/AuthProvider/AuthProvider';
import { loaderResult } from '@src/utils/loaderResult';
import { Profile } from './../Profile/Profile';
import {
    FieldResolver,
    Resolver,
    ResolverInterface,
    Root,
    ID,
    Ctx,
    Mutation,
    Arg,
    Args,
} from 'type-graphql';
import { AppFile } from './AppFile';
import { SignedUrl } from '../SignedUrl/SignedUrl';

@Resolver(() => AppFile)
export class AppFileResolvers implements ResolverInterface<AppFile> {
    @Mutation(() => Boolean)
    async deleteFile(
        @Args(() => DeleteFileArgs) { category, folder, name }: DeleteFileArgs,
        @Ctx() { storage }: Context
    ): Promise<boolean> {
        await storage.deleteFile(
            category as unknown as StorageBucket,
            folder,
            name
        );

        return true;
    }

    @FieldResolver(() => ID)
    async id(@Root() { file }: AppFile): Promise<string> {
        return file.metadata.id;
    }

    @FieldResolver()
    async name(@Root() { file }: AppFile): Promise<string> {
        return file.metadata.name;
    }

    @FieldResolver(() => Profile)
    async created_by(@Root() { file }: AppFile): Promise<Profile> {
        if (!file.metadata || !file.metadata.metadata.created_by) return null;
        return loaderResult(
            await UserLoader.load(file.metadata.metadata.created_by)
        );
    }

    @FieldResolver(() => Date)
    async date_created(@Root() { file }: AppFile): Promise<Date> {
        return new Date(file.metadata.timeCreated);
    }

    @FieldResolver(() => SignedUrl)
    async url(
        @Root() { file, folder }: AppFile,
        @Ctx() { storage }: Context
    ): Promise<SignedUrl> {
        const category = file.bucket.metadata.id;
        const url = await storage.signedReadUrl(
            category as StorageBucket,
            folder,
            file.metadata.name
        );

        return { url };
    }

    @FieldResolver(() => SignedUrl)
    async delete_url(
        @Root() { file, folder }: AppFile,
        @Ctx() { storage, jwt }: Context
    ): Promise<SignedUrl> {
        const category = file.bucket.id;
        const url = await storage.signedWriteUrl(
            category as StorageBucket,
            folder,
            file.metadata.name,
            jwt.sub || '',
            'delete'
        );

        return { url };
    }
}

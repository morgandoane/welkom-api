import { UserInputError } from 'apollo-server-core';
import { Profile } from './../Profile/Profile';
import {
    StorageBucket,
    AppStorage,
} from './../../services/CloudStorage/CloudStorage';
import { Permitted } from '@src/auth/middleware/Permitted';
import { AppFile } from './AppFile';
import {
    Arg,
    Mutation,
    Resolver,
    UseMiddleware,
    FieldResolver,
    Root,
    Query,
    Field,
    ObjectType,
} from 'type-graphql';
import { UserLoader } from '@src/services/AuthProvider/AuthProvider';

@ObjectType()
export class ForgeUrn {
    @Field()
    urn: string;

    @Field()
    token: string;
}

@Resolver(() => AppFile)
export class AppFileResolvers {
    @UseMiddleware(Permitted())
    @Query(() => AppFile)
    async file(
        @Arg('bucket', () => StorageBucket) storage_bucket: StorageBucket,
        @Arg('identifier') identifier: string,
        @Arg('filename') filename: string
    ): Promise<AppFile> {
        const bucket = await AppStorage.bucket(storage_bucket);
        const file = await bucket.file(
            AppStorage.filename(identifier, filename)
        );

        const exists = await file.exists();

        if (!exists) throw new UserInputError('Failed to find file');

        return AppFile.fromFile(identifier, file);
    }

    @UseMiddleware(Permitted())
    @Mutation(() => Boolean)
    async renameFile(
        @Arg('bucket', () => StorageBucket) bucket: StorageBucket,
        @Arg('folder') folder: string,
        @Arg('filename') filename: string,
        @Arg('new_filename') new_filename: string
    ): Promise<boolean> {
        await AppStorage.renameFile(bucket, folder, filename, new_filename);
        return true;
    }

    @UseMiddleware(Permitted())
    @Mutation(() => Boolean)
    async deleteFile(
        @Arg('bucket', () => StorageBucket) bucket: StorageBucket,
        @Arg('folder') folder: string,
        @Arg('filename') filename: string
    ): Promise<boolean> {
        await AppStorage.deleteFile(bucket, folder, filename);
        return true;
    }

    @UseMiddleware(Permitted())
    @Mutation(() => Boolean)
    async removePhoto(@Arg('folder') prefix: string): Promise<boolean> {
        const bucket = await AppStorage.bucket(
            StorageBucket.ldbbakery_profiles
        );

        await bucket.deleteFiles({ prefix });

        return true;
    }

    @FieldResolver(() => String)
    async url(@Root() { parent, name }: AppFile): Promise<string> {
        return await AppStorage.signedReadUrl(
            StorageBucket.ldbbakery_attachments,
            parent,
            name
        );
    }

    @FieldResolver(() => String)
    async created_by(@Root() { doc }: AppFile): Promise<Profile> {
        return await UserLoader.load(doc.metadata.metadata.created_by);
    }

    @FieldResolver(() => ForgeUrn)
    async viewer_urn(@Root() appFile: AppFile): Promise<ForgeUrn> {
        const forgeObject = await appFile.forgeObject();

        const { urn, token } = await forgeObject.svf2();

        return { urn, token };
    }
}

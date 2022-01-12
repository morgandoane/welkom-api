import { AppFile } from './../../AppFile';
import {
    Ctx,
    Field,
    FieldResolver,
    ID,
    ObjectType,
    Resolver,
    ResolverInterface,
    Root,
} from 'type-graphql';
import { StorageBucket } from '@src/services/CloudStorage/CloudStorage';
import { Bol } from '@src/schema/Bol/Bol';
import { File } from '@google-cloud/storage';
import { Profile } from '@src/schema/Profile/Profile';
import { SignedUrl } from '@src/schema/SignedUrl/SignedUrl';
import { UserLoader } from '@src/services/AuthProvider/AuthProvider';
import { loaderResult } from '@src/utils/loaderResult';
import { Context } from 'vm';

@ObjectType()
export class BolFile extends AppFile {
    @Field()
    contents?: boolean;

    private _bol: Bol;

    public get bol(): Bol {
        return this._bol;
    }

    private _bolFile: File;

    public get bolFile(): File {
        return this._bolFile;
    }

    public static fromFileAndBol(file: File, bol: Bol): BolFile {
        const bolFile = new BolFile();

        bolFile._bol = bol;
        bolFile._bolFile = file;

        return bolFile;
    }
}

@Resolver(() => BolFile)
export class BolFileResolvers implements ResolverInterface<BolFile> {
    @FieldResolver(() => ID)
    async id(@Root() { bolFile }: BolFile): Promise<string> {
        return bolFile.metadata.id;
    }

    @FieldResolver(() => String)
    async name(@Root() { bolFile }: BolFile): Promise<string> {
        return bolFile.metadata.name;
    }

    @FieldResolver(() => Profile)
    async created_by(@Root() { bolFile }: BolFile): Promise<Profile> {
        if (!bolFile.metadata || !bolFile.metadata.metadata.created_by)
            return null;
        return loaderResult(
            await UserLoader.load(bolFile.metadata.metadata.created_by)
        );
    }

    @FieldResolver(() => Date)
    async date_created(@Root() { bolFile }: BolFile): Promise<Date> {
        return new Date(bolFile.metadata.timeCreated);
    }

    @FieldResolver(() => SignedUrl)
    async url(
        @Root() { bolFile, folder }: BolFile,
        @Ctx() { storage }: Context
    ): Promise<SignedUrl> {
        const category = bolFile.bucket.id;
        const url = await storage.signedReadUrl(
            category as StorageBucket,
            folder,
            bolFile.metadata.name
        );

        return { url };
    }

    @FieldResolver(() => SignedUrl)
    async delete_url(
        @Root() { bolFile, folder }: BolFile,
        @Ctx() { storage, jwt }: Context
    ): Promise<SignedUrl> {
        const category = bolFile.bucket.id;
        const url = await storage.signedWriteUrl(
            category as StorageBucket,
            folder,
            bolFile.metadata.name,
            jwt.sub || '',
            'delete'
        );

        return { url };
    }
}

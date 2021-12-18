import { SignedUrl } from '@src/schema/SignedUrl/SignedUrl';
import { Profile } from './../Profile/Profile';
import { Field, ObjectType, ID } from 'type-graphql';
import { File } from '@google-cloud/storage';

@ObjectType()
export class AppFile {
    @Field()
    name: string;

    @Field(() => ID)
    id: string;

    @Field(() => Profile, { nullable: true })
    created_by: Profile;

    @Field()
    date_created: Date;

    @Field(() => SignedUrl)
    url: SignedUrl;

    private _file: File;

    public get file(): File {
        return this._file;
    }

    private _folder: string;

    public get folder(): string {
        return this._folder;
    }

    public static fromFile(file: File, folder: string): AppFile {
        const appFile = new AppFile();

        appFile._file = file;
        appFile._folder = folder;

        return appFile;
    }
}

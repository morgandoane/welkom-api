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

    private _file: File;

    public get file(): File {
        return this._file;
    }

    public static fromFile(file: File): AppFile {
        const appFile = new AppFile();

        appFile._file = file;

        return appFile;
    }
}

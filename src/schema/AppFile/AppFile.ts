import { ForgeObject, Forge, ForgeBucket } from './../../services/Forge/Forge';
import { Profile } from './../Profile/Profile';
import { Field, ObjectType, ID } from 'type-graphql';
import { File } from '@google-cloud/storage';

@ObjectType()
export class AppFile {
    @Field(() => ID)
    id: string;

    @Field()
    parent: string;

    @Field()
    url: string;

    @Field()
    display_name: string;

    @Field()
    name: string;

    @Field(() => Profile)
    created_by: Profile;

    @Field()
    date_created: Date;

    private _doc?: File;

    public get doc(): File {
        return this._doc;
    }

    public static fromFile(parent: string, file: File): AppFile {
        const res = new AppFile();
        res._doc = file;

        res.id = file.metadata.id;
        res.name = file.metadata.name.replace(parent + '/', '');
        res.display_name = res.name.split('.')[0];
        res.date_created = new Date(file.metadata.timeCreated);
        res.parent = parent;

        return res;
    }

    public async forgeObject(): Promise<ForgeObject> {
        const bucket = await Forge.bucket(this.parent);
        const existingObject = await bucket.object(this.doc.metadata.name);
        if (existingObject) return existingObject;
        else {
            const res = await bucket.uploadObject(this.doc);
            return res;
        }
    }
}

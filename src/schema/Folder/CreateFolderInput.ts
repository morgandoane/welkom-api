import { Context } from '@src/auth/context';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { FolderClass, Folder, FolderLoader } from './Folder';

@InputType()
export class CreateFolderInput {
    @Field(() => FolderClass)
    class!: FolderClass;

    @Field()
    name!: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    parent!: Ref<Folder> | null;

    public async validateFolder(context: Context): Promise<Folder> {
        const parent = this.parent
            ? await FolderLoader.load(this.parent, true)
            : null;

        return { ...context.base, ...this, parent: parent ? parent._id : null };
    }
}

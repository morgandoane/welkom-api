import { UserInputError } from 'apollo-server-errors';
import { Context } from './../../auth/context';
import { loaderResult } from './../../utils/loaderResult';
import { ObjectId } from 'mongoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Field, InputType } from 'type-graphql';
import { Folder, FolderClass, FolderLoader } from './Folder';

@InputType()
export class FolderInput {
    @Field(() => FolderClass)
    class!: FolderClass;

    @Field()
    name!: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    parent?: ObjectId;

    public async validate({ base }: Context): Promise<Folder> {
        if (this.parent) {
            const parent = loaderResult(
                await FolderLoader.load(this.parent.toString())
            );

            if (parent.class !== this.class)
                throw new UserInputError('Class mismatch between folders.');

            return {
                ...base,
                class: this.class,
                name: this.name,
                parent: parent._id,
            };
        } else {
            return { ...base, class: this.class, name: this.name };
        }
    }
}

@InputType()
export class UpdateFolderInput {
    @Field({ nullable: true })
    deleted?: boolean;

    @Field({ nullable: true })
    name?: string;
}

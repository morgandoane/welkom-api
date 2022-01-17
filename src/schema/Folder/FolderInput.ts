import { UserInputError } from 'apollo-server-errors';
import { Context } from './../../auth/context';
import { loaderResult } from './../../utils/loaderResult';
import { ObjectId, UpdateQuery } from 'mongoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Field, InputType } from 'type-graphql';
import { Folder, FolderClass, FolderLoader, FolderModel } from './Folder';

@InputType()
export class CreateFolderInput {
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

    @Field(() => ObjectIdScalar, { nullable: true })
    parent?: ObjectId;

    public async serializeFolderUpdate(
        context: Context
    ): Promise<Partial<Folder>> {
        const res: Partial<Folder> = {
            date_modified: new Date(),
            modified_by: context.base.modified_by,
        };

        if (this.name) res.name = this.name;
        if (this.deleted !== undefined && this.deleted !== null)
            res.deleted = this.deleted;

        if (this.parent !== undefined) {
            if (this.parent == null) res.parent = null;
            else {
                const parent = await FolderModel.findById(
                    this.parent.toString()
                );

                res.parent = parent._id;
            }
        }

        return res;
    }
}

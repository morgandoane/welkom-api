import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Folder, FolderLoader } from './Folder';

@InputType()
export class UpdateFolderInput {
    @Field({ nullable: true })
    deleted?: boolean;

    @Field({ nullable: true })
    name?: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    parent?: Ref<Folder> | null;

    public async serializeFolder(): Promise<Partial<Folder>> {
        const res: Partial<Folder> = {};

        if (this.parent !== undefined) {
            if (this.parent == null) res.parent = null;
            else {
                const parent = await FolderLoader.load(this.parent, true);
                res.parent = parent._id;
            }
        }

        if (this.name) res.name = this.name;
        if (this.deleted !== null && this.deleted !== undefined) {
            res.deleted = this.deleted;
        }

        return res;
    }
}

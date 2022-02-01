import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Folder } from '../Folder/Folder';
import { Item } from '../Item/Item';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Recipe } from './Recipe';

@InputType()
export class UpdateRecipeInput {
    @Field({ nullable: true })
    deleted?: boolean;

    @Field({ nullable: true })
    name?: string;

    @Field(() => ObjectIdScalar)
    item?: Ref<Item>;

    @Field(() => ObjectIdScalar, { nullable: true })
    folder?: Ref<Folder> | null;

    public async serializeRecipeUpdate(): Promise<Partial<Recipe>> {
        const res: Partial<Recipe> = {};

        if (this.deleted !== undefined && this.deleted !== null)
            res.deleted = this.deleted;
        if (this.name) res.name = this.name;
        if (this.item) res.item = this.item;
        if (this.folder !== undefined) res.folder = this.folder;

        return res;
    }
}

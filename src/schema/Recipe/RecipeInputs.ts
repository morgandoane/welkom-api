import { Folder, FolderLoader } from './../Folder/Folder';
import { ItemLoader } from './../Item/Item';
import { loaderResult } from './../../utils/loaderResult';
import { Context } from './../../auth/context';
import { Field, InputType } from 'type-graphql';
import { Recipe } from './Recipe';

@InputType()
export class CreateRecipeInput {
    @Field()
    name: string;

    @Field()
    item: string;

    @Field({ nullable: true })
    folder?: string;

    public async validateRecipeInput({ base }: Context): Promise<Recipe> {
        const item = loaderResult(await ItemLoader.load(this.item));
        let folder: Folder | null = null;

        if (this.folder) {
            folder = loaderResult(await FolderLoader.load(this.folder));
        }

        return {
            ...base,
            name: this.name,
            item: item._id,
            folder: folder ? folder._id : null,
        };
    }
}

@InputType()
export class UpdateRecipeInput {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    deleted?: boolean;

    @Field({ nullable: true })
    item?: string;

    @Field({ nullable: true })
    folder?: string;

    public async validateRecipeUpdate({
        base,
    }: Context): Promise<Partial<Recipe>> {
        const res: Partial<Recipe> = {
            date_modified: base.date_modified,
            modified_by: base.modified_by,
        };

        if (this.name) res.name = this.name;

        if (this.item) {
            const item = loaderResult(await ItemLoader.load(this.item));
            res.item = item._id;
        }

        if (this.folder) {
            const folder = loaderResult(await FolderLoader.load(this.folder));
            res.folder = folder._id;
        }

        if (this.deleted !== undefined && this.deleted !== null) {
            res.deleted = this.deleted;
        }

        return res;
    }
}

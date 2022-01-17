import { ItemLoader } from './../Item/Item';
import { loaderResult } from './../../utils/loaderResult';
import { BaseFilter } from './../Base/BaseFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { Recipe } from './Recipe';

@InputType()
export class RecipeFilter extends BaseFilter {
    @Field({ nullable: true })
    item?: string;

    @Field({ nullable: true })
    name?: string;

    public async serialize(): Promise<FilterQuery<Recipe>> {
        const res: FilterQuery<Recipe> = {
            ...this.serializeBaseFilter(),
        };

        if (this.item) {
            const item = loaderResult(await ItemLoader.load(this.item));
            res.item = item._id;
        }

        if (this.name) {
            res.name = { $regex: new RegExp(this.name, 'i') };
        }

        return res;
    }
}

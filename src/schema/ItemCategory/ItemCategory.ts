import { Context } from '@src/auth/context';
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Base } from '../Base/Base';
import { ItemModel } from '../Item/Item';
import { getBaseLoader } from '../Loader';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'itemcategories',
    },
})
export class ItemCategory extends Base {
    @Field()
    @prop({ required: true, unique: true })
    label!: string;
}

export const ItemCategoryModel = getModelForClass(ItemCategory);
export const ItemCategoryLoader = getBaseLoader(ItemCategoryModel);

export const getFlashItemCategory = async ({
    base,
}: Context): Promise<ItemCategory> => {
    const doc = await ItemCategoryModel.findOne({ name: 'Unscheduled' });
    if (doc) return doc;
    const newDoc: ItemCategory = { ...base, label: 'Unscheduled' };
    const res = await ItemModel.create(newDoc);
    return res.toJSON() as unknown as ItemCategory;
};

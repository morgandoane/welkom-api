import { getBaseLoader } from './../Loader';
import { ItemClass } from './../ItemClass/ItemClass';
import { Field, ObjectType } from 'type-graphql';
import { Configured } from '../Configured/Configured';
import { UnitClass } from '../Unit/Unit';
import {
    DocumentType,
    getModelForClass,
    modelOptions,
    mongoose,
    prop,
    Ref,
} from '@typegoose/typegoose';
import DataLoader from 'dataloader';
import { ObjectId } from 'mongoose';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'items',
    },
})
export class Item extends Configured {
    @Field(() => ItemClass)
    @prop({ required: true, ref: () => ItemClass })
    item_class!: Ref<ItemClass>;

    @Field(() => UnitClass)
    @prop({ required: true, enum: UnitClass })
    unit_class!: UnitClass;

    @Field()
    @prop({ required: true })
    english!: string;

    @Field()
    @prop({ required: true })
    spanish!: string;
}

export const ItemModel = getModelForClass(Item);

export const ItemLoader = getBaseLoader(ItemModel);

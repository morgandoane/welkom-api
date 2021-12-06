import { ItemClass } from './../ItemClass/ItemClass';
import { Field, ObjectType } from 'type-graphql';
import { Configured } from '../Configured/Configured';
import { UnitClass } from '../Unit/Unit';
import {
    getModelForClass,
    modelOptions,
    prop,
    Ref,
} from '@typegoose/typegoose';

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

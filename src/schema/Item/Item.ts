import { Conversion } from './../Conversion/Conversion';
import { Base } from './../Base/Base';
import { getBaseLoader } from './../Loader';
import { Field, ObjectType } from 'type-graphql';
import { UnitClass } from '../Unit/Unit';
import { getModelForClass, prop, modelOptions } from '@typegoose/typegoose';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'items',
    },
})
export class Item extends Base {
    @Field(() => UnitClass)
    @prop({ required: true, enum: UnitClass })
    unit_class!: UnitClass;

    @Field()
    @prop({ required: true })
    english!: string;

    @Field()
    @prop({ required: true })
    spanish!: string;

    @Field(() => [Conversion])
    @prop({ required: true, type: () => Conversion })
    conversions!: Conversion[];
}

export const ItemModel = getModelForClass(Item);

export const ItemLoader = getBaseLoader(ItemModel);

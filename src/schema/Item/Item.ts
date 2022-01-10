import { Conversion } from './../Conversion/Conversion';
import { Base } from './../Base/Base';
import { getBaseLoader } from './../Loader';
import { Field, ObjectType } from 'type-graphql';
import { Unit, UnitClass } from '../Unit/Unit';
import {
    getModelForClass,
    prop,
    modelOptions,
    Ref,
} from '@typegoose/typegoose';
import { Company } from '../Company/Company';

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

    @prop({ required: false, type: () => [Number] })
    order_queue_qtys?: [number, number];

    @Field(() => Number, { nullable: true })
    @prop({ required: false })
    order_queue_qty?: number;

    @Field(() => Unit, { nullable: true })
    @prop({ required: false, ref: () => Unit })
    default_unit?: Ref<Unit>;

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    default_vendor?: Ref<Company>;

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

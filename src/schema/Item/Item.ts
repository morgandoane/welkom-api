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
import { ObjectId } from 'mongoose';

export enum ItemType {
    Product = 'Product',
    Cookie = 'Cookie',
}

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

    @Field(() => ItemType, { nullable: true })
    @prop({ required: false })
    type?: ItemType;

    @Field(() => String, { nullable: true })
    @prop({ required: false })
    upc?: string;

    // if unit class is weight, count, or time, this is 1. If it is volume, it is a multiplier to get to weight.
    @Field()
    @prop({ required: true, default: 1 })
    to_base_unit!: number;

    @prop({ required: false, type: () => [[Number]] })
    order_queue_qtys?: [number, number][];

    @Field(() => Number, { nullable: true })
    @prop({ required: false })
    order_queue_qty?: number;

    @Field(() => Unit, { nullable: true })
    @prop({ required: false, ref: () => Unit })
    default_unit?: Ref<Unit> | ObjectId;

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    default_vendor?: Ref<Company> | ObjectId;

    @Field()
    @prop({ required: true })
    english!: string;

    @Field()
    @prop({ required: true })
    spanish!: string;

    @Field(() => [Conversion])
    @prop({ required: true, type: () => Conversion })
    conversions!: Conversion[];

    @Field({ nullable: true })
    @prop({ required: false, default: false })
    primitive?: boolean;
}

export const ItemModel = getModelForClass(Item);

export const ItemLoader = getBaseLoader(ItemModel);

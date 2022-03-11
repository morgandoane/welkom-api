import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import { Names } from './../Names/Names';
import { Base } from '@src/schema/Base/Base';
import { modelOptions, getModelForClass, prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { BaseUnit } from '../Unit/BaseUnit';
import { Min, MinLength } from 'class-validator';
import { getBaseLoader } from '@src/utils/baseLoader';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'items',
    },
})
export class Item extends UploadEnabled {
    @Field(() => Names)
    @prop({ required: true })
    names!: Names;

    @Field(() => BaseUnit)
    @prop({ required: true, enum: BaseUnit })
    base_unit!: BaseUnit;

    // Count = 1;
    // Weight = 1;
    // Volume = X Gallons / 1 Pound
    @Min(0)
    @Field()
    @prop({ required: true, min: 0 })
    per_base_unit!: number;
}

export const ItemModel = getModelForClass(Item);
export const ItemLoader = getBaseLoader(ItemModel);

import { UnitClass } from './../../../Unit/UnitClass';
import { ItemModel } from '../../Item';
import {
    modelOptions,
    getDiscriminatorModelForClass,
    prop,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Item } from '../../Item';
import { getBaseLoader } from '@src/utils/baseLoader';

export enum IngredientUnitClass {
    Weight = 'Weight',
    Volume = 'Volume',
}

@ObjectType()
@modelOptions({
    schemaOptions: {
        discriminatorKey: 'ingredient',
    },
})
export class Ingredient extends Item {
    @Field(() => IngredientUnitClass)
    @prop({ required: true, enum: IngredientUnitClass })
    unit_class!: IngredientUnitClass;
}

export const IngredientModel = getDiscriminatorModelForClass(
    ItemModel,
    Ingredient
);
export const IngredientLoader = getBaseLoader(IngredientModel);

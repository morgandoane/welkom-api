import { ItemModel } from '../../Item';
import {
    modelOptions,
    getDiscriminatorModelForClass,
} from '@typegoose/typegoose';
import { ObjectType } from 'type-graphql';
import { Item } from '../../Item';
import { getBaseLoader } from '@src/utils/baseLoader';

@ObjectType()
@modelOptions({
    schemaOptions: {
        discriminatorKey: 'ingredient',
    },
})
export class Ingredient extends Item {}

export const IngredientModel = getDiscriminatorModelForClass(
    ItemModel,
    Ingredient
);
export const IngredientLoader = getBaseLoader(IngredientModel);

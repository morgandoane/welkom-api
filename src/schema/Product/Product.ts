import { getBaseLoader } from '@src/schema/Loader';
import { ItemModel } from './../Item/Item';
import {
    getDiscriminatorModelForClass,
    modelOptions,
} from '@typegoose/typegoose';
import { ObjectType } from 'type-graphql';
import { Item } from '../Item/Item';

@ObjectType()
@modelOptions({
    schemaOptions: {
        discriminatorKey: 'product',
    },
})
export class Product extends Item {}

export const ProductModel = getDiscriminatorModelForClass(ItemModel, Product);
export const ProductLoader = getBaseLoader(ProductModel);

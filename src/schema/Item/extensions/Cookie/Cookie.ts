import { ItemModel } from './../../Item';
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
        discriminatorKey: 'cookie',
    },
})
export class Cookie extends Item {}

export const CookieModel = getDiscriminatorModelForClass(ItemModel, Cookie);
export const CookieLoader = getBaseLoader(CookieModel);

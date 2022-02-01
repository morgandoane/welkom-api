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
        discriminatorKey: 'misc',
    },
})
export class MiscItem extends Item {}

export const MiscItemModel = getDiscriminatorModelForClass(ItemModel, MiscItem);
export const MiscItemLoader = getBaseLoader(MiscItemModel);

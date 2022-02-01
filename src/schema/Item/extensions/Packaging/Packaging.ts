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
        discriminatorKey: 'packaging',
    },
})
export class Packaging extends Item {}

export const PackagingModel = getDiscriminatorModelForClass(
    ItemModel,
    Packaging
);
export const PackagingLoader = getBaseLoader(PackagingModel);

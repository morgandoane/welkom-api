import { ConfigModel } from './../Config/Config';
import { ConfigKey } from '@src/schema/Config/Config';
import {
    getModelForClass,
    prop,
    getDiscriminatorModelForClass,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Config } from '../Config/Config';

@ObjectType()
export class ItemClass extends Config {
    @Field(() => ConfigKey)
    @prop({ required: true })
    key: ConfigKey.Item;

    @Field()
    @prop({ required: true })
    name: string;

    @Field()
    @prop({ required: true, default: false })
    deleted!: boolean;
}

export const ItemClassModel = getDiscriminatorModelForClass(
    ConfigModel,
    ItemClass
);

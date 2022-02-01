import { ItemModel } from '../../Item';
import {
    modelOptions,
    getDiscriminatorModelForClass,
    prop,
    index,
    Ref,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Item } from '../../Item';
import { getBaseLoader } from '@src/utils/baseLoader';
import { Company } from '@src/schema/Company/Company';

@ObjectType()
@modelOptions({
    schemaOptions: {
        discriminatorKey: 'product',
    },
})
@index({ upc: 1, company: 1 }, { unique: true })
export class Product extends Item {
    @Field()
    @prop({ required: true })
    upc!: string;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    company!: Ref<Company>;
}

export const ProductModel = getDiscriminatorModelForClass(ItemModel, Product);
export const ProductLoader = getBaseLoader(ProductModel);

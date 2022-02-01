import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import {
    modelOptions,
    getModelForClass,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { getBaseLoader } from '@src/utils/baseLoader';
import { Location } from '../Location/Location';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'productionlines',
    },
})
export class ProductionLine extends UploadEnabled {
    @Field()
    @prop({ required: true })
    name!: string;

    @Field(() => Location)
    @prop({ required: true, ref: () => Location })
    location!: Ref<Location>;
}

export const ProductionLineModel = getModelForClass(ProductionLine);
export const ProductionLineLoader = getBaseLoader(ProductionLineModel);

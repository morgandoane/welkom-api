import { BatchlotContent } from './../BatchLotContent/BatchlotContent';
import { Lot, LotModel } from './../Lot/Lot';
import {
    modelOptions,
    prop,
    getDiscriminatorModelForClass,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { getBaseLoader } from '@src/utils/baseLoader';

@ObjectType()
@modelOptions({
    schemaOptions: {
        discriminatorKey: 'batch',
    },
})
export class BatchLot extends Lot {
    @Field(() => [BatchlotContent])
    @prop({ required: true, type: () => BatchlotContent })
    contents!: BatchlotContent[];
}

export const BatchLotModel = getDiscriminatorModelForClass(LotModel, BatchLot);
export const BatchLotLoader = getBaseLoader(BatchLotModel);

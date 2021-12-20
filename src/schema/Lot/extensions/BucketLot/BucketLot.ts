import { getBaseLoader } from './../../../Loader';
import { Field, ObjectType } from 'type-graphql';
import { LotModel } from '../../Lot';
import {
    getDiscriminatorModelForClass,
    getModelForClass,
    prop,
} from '@typegoose/typegoose';
import { Lot } from '../../Lot';
import { LotContent } from '@src/schema/Content/Content';

@ObjectType()
export class BucketLotContent extends LotContent {}

@ObjectType()
export class BucketLot extends Lot {
    @Field(() => BucketLotContent)
    @prop({ required: true })
    contents!: BucketLotContent[];
}

export const BucketLotModel = getDiscriminatorModelForClass(
    LotModel,
    BucketLot
);

export const BucketLotLoader = getBaseLoader(BucketLotModel);
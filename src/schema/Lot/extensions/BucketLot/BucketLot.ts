import { getBaseLoader } from './../../../Loader';
import { Field, ObjectType } from 'type-graphql';
import { LotModel } from '../../Lot';
import { getDiscriminatorModelForClass, prop } from '@typegoose/typegoose';
import { Lot } from '../../Lot';
import { LotContent } from '@src/schema/Content/LotContent';

@ObjectType()
export class BucketLotContent extends LotContent {}

@ObjectType()
export class BucketLot extends Lot {
    @Field(() => [BucketLotContent])
    @prop({ required: true, type: () => BucketLotContent })
    contents!: BucketLotContent[];
}

export const BucketLotModel = getDiscriminatorModelForClass(
    LotModel,
    BucketLot
);

export const BucketLotLoader = getBaseLoader(BucketLotModel);

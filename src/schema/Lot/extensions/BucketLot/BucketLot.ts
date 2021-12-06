import { ObjectType } from 'type-graphql';
import { LotModel } from '../../Lot';
import { getDiscriminatorModelForClass } from '@typegoose/typegoose';
import { Lot } from '../../Lot';

@ObjectType()
export class BucketLot extends Lot {}

export const ProceduralLotModel = getDiscriminatorModelForClass(
    LotModel,
    BucketLot
);

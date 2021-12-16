import { getBaseLoader } from './../../../Loader';
import { LotModel } from '../../Lot';
import { getDiscriminatorModelForClass, prop } from '@typegoose/typegoose';
import { Lot } from '../../Lot';
import { Field, ObjectType } from 'type-graphql';
import { LotContent } from '@src/schema/Content/Content';

@ObjectType()
export class ProceduralLotContent extends LotContent {}

@ObjectType()
export class ProceduralLot extends Lot {
    @Field(() => ProceduralLotContent)
    @prop({ required: true, type: () => ProceduralLotContent })
    contents!: ProceduralLotContent[];
}

export const ProceduralLotModel = getDiscriminatorModelForClass(
    LotModel,
    ProceduralLot
);

export const ProceduralLotLoader = getBaseLoader(ProceduralLotModel);

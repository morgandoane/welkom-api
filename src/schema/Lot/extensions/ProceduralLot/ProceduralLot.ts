import { ProcedureStep } from '../../../ProcedureStep/ProcedureStep';
import { LotModel } from '../../Lot';
import { getDiscriminatorModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Lot } from '../../Lot';
import { Field, ObjectType } from 'type-graphql';
import { LotContent } from '@src/schema/Content/Content';

@ObjectType()
export class ProceduralLotContent extends LotContent {
    @Field(() => ProcedureStep, { nullable: true })
    @prop({ required: false, ref: () => ProcedureStep })
    step?: Ref<ProcedureStep>;
}

@ObjectType()
export class ProceduralLot extends Lot {
    @Field(() => ProceduralLotContent)
    @prop({ required: true, type: () => ProceduralLotContent })
    contents!: ProceduralLotContent[];
}

export const RecipeLotModel = getDiscriminatorModelForClass(
    LotModel,
    ProceduralLot
);

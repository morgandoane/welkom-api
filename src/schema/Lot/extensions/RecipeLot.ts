import { ProcedureStep } from '../../ProcedureStep/ProcedureStep';
import { LotModel, LotContent } from '../Lot';
import { getDiscriminatorModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Lot } from '../Lot';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class _RecipeLotContent extends LotContent {
    @Field(() => ProcedureStep, { nullable: true })
    @prop({ required: false, ref: () => ProcedureStep })
    step?: Ref<ProcedureStep>;
}

@ObjectType()
export class _RecipeLot extends Lot {
    @Field(() => _RecipeLotContent)
    @prop({ required: true, type: () => _RecipeLotContent })
    contents!: _RecipeLotContent[];
}

export const RecipeLotModel = getDiscriminatorModelForClass(
    LotModel,
    _RecipeLot
);

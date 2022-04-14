import { RecipeStep } from './../../../RecipeStep/RecipeStep';
import { getBaseLoader } from './../../../Loader';
import { LotModel } from '../../Lot';
import { getDiscriminatorModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Lot } from '../../Lot';
import { Field, ObjectType } from 'type-graphql';
import { LotContent } from '@src/schema/Content/LotContent';

@ObjectType()
export class ProceduralLotContent extends LotContent {
    @Field(() => RecipeStep, { nullable: true })
    @prop({ required: false, ref: () => RecipeStep })
    recipe_step?: Ref<RecipeStep>;
}

@ObjectType()
export class ProceduralLot extends Lot {
    @Field(() => [ProceduralLotContent])
    @prop({ required: true, type: () => ProceduralLotContent })
    contents!: ProceduralLotContent[];
}

export const ProceduralLotModel = getDiscriminatorModelForClass(
    LotModel,
    ProceduralLot
);

export const ProceduralLotLoader = getBaseLoader(ProceduralLotModel);

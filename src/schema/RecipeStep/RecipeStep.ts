import { ItemPluralContent } from '../Content/Content';
import { Unit } from '../Unit/Unit';
import { prop } from '@typegoose/typegoose';
import { ProcedureStep } from '../ProcedureStep/ProcedureStep';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class RecipeStep extends ProcedureStep {
    @Field(() => ItemPluralContent, { nullable: true })
    @prop({ required: false })
    content?: ItemPluralContent;
}

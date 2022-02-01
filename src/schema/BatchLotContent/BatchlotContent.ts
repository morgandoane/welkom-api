import { prop, Ref } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { LotContent } from '../LotContent/LotContent';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { RecipeStep } from '../RecipeStep/RecipeStep';

@ObjectType()
export class BatchlotContent extends LotContent {
    @Field(() => ObjectIdScalar, { nullable: true })
    @prop({ required: false, ref: () => RecipeStep })
    recipe_step!: Ref<RecipeStep> | null;
}

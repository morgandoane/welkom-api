import { RecipeStepContent } from './../RecipeStepContent/RecipeStepContent';
import { Names } from './../Names/Names';
import { Identified } from '../Base/Base';
import { Field, ObjectType } from 'type-graphql';
import { prop } from '@typegoose/typegoose';

@ObjectType()
export class RecipeStep extends Identified {
    @Field(() => Names, { nullable: true })
    @prop({ required: false })
    instruction!: Names | null;

    @Field(() => RecipeStepContent, { nullable: true })
    @prop({ required: false })
    content!: RecipeStepContent | null;
}

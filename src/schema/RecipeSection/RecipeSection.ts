import { Identified } from './../Base/Base';
import { Field, ObjectType } from 'type-graphql';
import { prop } from '@typegoose/typegoose';
import { RecipeStep } from '../RecipeStep/RecipeStep';

@ObjectType()
export class RecipeSection extends Identified {
    @Field({ nullable: true })
    @prop({ required: false })
    label!: string | null;

    @Field(() => [RecipeStep])
    @prop({ required: true, type: () => RecipeStep })
    steps!: RecipeStep[];
}

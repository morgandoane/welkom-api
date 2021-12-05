import { RecipeStep } from '../RecipeStep/RecipeStep';
import { getModelForClass, prop } from '@typegoose/typegoose';
import { Configured } from '../Configured/Configured';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class RecipeStepIndexed {
    @Field()
    index: number;

    @Field(() => [RecipeStep])
    steps: RecipeStep[];
}

@ObjectType()
export class Recipe extends Configured {
    @Field(() => [RecipeStepIndexed])
    @prop({ required: true })
    steps!: RecipeStep[][];

    @Field()
    @prop({ required: true })
    name!: string;

    @Field()
    @prop({ required: true })
    identifier!: string;
}

export const RecipeModel = getModelForClass(Recipe);

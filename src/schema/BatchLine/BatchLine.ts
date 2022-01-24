import { RecipeStep } from './../RecipeStep/RecipeStep';
import { Lot } from './../Lot/Lot';
import { Field, ObjectType } from 'type-graphql';

// When a mixer makes a scan, this will tell them which lots are a match, and which steps they will work for.
@ObjectType()
export class BatchLine {
    @Field(() => Lot)
    lot!: Lot;

    @Field(() => [RecipeStep])
    steps: RecipeStep[];
}

import { Field, InputType } from 'type-graphql';

@InputType()
export class NumberRangeInput {
    @Field()
    min!: number;

    @Field()
    max!: number;
}

import { Field, InputType } from 'type-graphql';

@InputType()
export class RangeInput {
    @Field()
    min: number;

    @Field()
    max: number;
}

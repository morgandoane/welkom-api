import { Field, InputType } from 'type-graphql';

@InputType()
export class DateRangeInput {
    @Field()
    start: Date;

    @Field()
    end: Date;
}

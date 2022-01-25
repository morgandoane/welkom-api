import { Max, Min } from 'class-validator';
import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class CreateTraysArg {
    @Min(1)
    @Max(100)
    @Field()
    count!: number;

    @Field()
    location!: string;
}

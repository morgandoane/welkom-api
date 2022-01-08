import { Field, InputType } from 'type-graphql';
import { Prompt, PromptType } from './Prompt';

@InputType()
export class RangeInput {
    @Field()
    min!: number;

    @Field()
    max!: number;
}

@InputType()
export class PromptInput {
    @Field(() => PromptType)
    type!: PromptType;

    @Field()
    phrase!: string;

    @Field({ nullable: true })
    valid_boolean?: boolean;

    @Field(() => RangeInput, { nullable: true })
    valid_range?: RangeInput;

    public serializePromptInput(): Prompt {
        return {
            type: this.type,
            phrase: this.phrase,
            valid_boolean: this.valid_boolean,
            valid_range: this.valid_range,
        };
    }
}

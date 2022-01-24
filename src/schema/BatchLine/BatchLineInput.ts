import { Field, InputType } from 'type-graphql';

@InputType()
export class BatchLineInput {
    @Field()
    batch!: string;

    @Field()
    code_or_id!: string;

    @Field(() => [String])
    active_steps!: string[];

    @Field({ nullable: true })
    crumb?: boolean;
}

import { Field, InputType } from 'type-graphql';

@InputType()
export class BatchLotInput {
    @Field()
    batch: string;

    @Field({ nullable: true })
    recipe_step?: string;

    @Field({ nullable: true })
    lot?: string;

    @Field({ nullable: true })
    recipe_step?: string;

    @Field({ nullable: true })
    recipe_step?: string;
}

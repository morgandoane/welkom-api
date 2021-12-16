import { Field, InputType } from 'type-graphql';

@InputType()
export class CreateCompanyInput {
    @Field()
    name: string;
}

@InputType()
export class UpdateCompanyInput {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    deleted?: boolean;
}

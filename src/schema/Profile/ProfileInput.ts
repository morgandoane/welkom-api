import { Field, InputType } from 'type-graphql';

@InputType()
export class ProfileInput {
    @Field()
    given_name!: string;

    @Field()
    family_name!: string;

    @Field()
    email!: string;

    @Field()
    phone_number!: string;

    @Field()
    temporary_password!: string;
}

@InputType()
export class UpdateProfileInput {
    @Field()
    given_name?: string;

    @Field()
    family_name?: string;

    @Field()
    email?: string;

    @Field()
    phone_number?: string;
}

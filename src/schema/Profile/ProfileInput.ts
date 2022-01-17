import { UserRole } from './../../auth/UserRole';
import { Field, InputType } from 'type-graphql';

@InputType()
export class CreateProfileInput {
    @Field(() => UserRole)
    role!: UserRole;

    @Field()
    given_name!: string;

    @Field()
    family_name!: string;

    @Field({ nullable: true })
    email?: string;

    @Field({ nullable: true })
    username?: string;

    @Field()
    phone_number!: string;

    @Field()
    temporary_password!: string;
}

@InputType()
export class UpdateProfileInput {
    @Field(() => UserRole, { nullable: true })
    role?: UserRole;

    @Field({ nullable: true })
    given_name?: string;

    @Field({ nullable: true })
    family_name?: string;

    @Field({ nullable: true })
    email?: string;

    @Field({ nullable: true })
    username?: string;

    @Field({ nullable: true })
    phone_number?: string;

    @Field({ nullable: true })
    password?: string;
}

import { Context } from '@src/auth/context';
import { UserRole } from '@src/auth/UserRole';
import { getId } from '@src/utils/getId';
import { UserInputError } from 'apollo-server-express';
import { Field, InputType } from 'type-graphql';
import { Profile } from './Profile';

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

    public async validateProfile(context: Context): Promise<Profile> {
        if (!this.username && !this.email)
            throw new UserInputError('Please provide a username or email.');

        return {
            ...context.base,
            ...this,
            roles: [this.role],
            name: `${this.given_name} ${this.family_name}`,
            app_metadata: {},
            email:
                this.email ||
                `${this.given_name}_${this.family_name}@accounts.littledutchboy.com`,
            _id: getId()._id.toString(),
        };
    }
}

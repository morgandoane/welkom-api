import { UserRole } from '@src/auth/UserRole';
import { Field, InputType } from 'type-graphql';
import { Profile } from './Profile';

@InputType()
export class UpdateProfileInput {
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

    @Field({ nullable: true })
    password?: string;

    @Field({ nullable: true })
    blocked?: boolean;

    public async serializeProfileUpdate(): Promise<
        Partial<Profile & { password: string }>
    > {
        const res: Partial<Profile & { password: string }> = {};

        if (this.role) res.roles = [this.role];
        if (this.given_name) res.given_name = this.given_name;
        if (this.family_name) res.family_name = this.family_name;
        if (this.email) res.email = this.email;
        if (this.username) res.username = this.username;
        if (this.password) res.password = this.password;
        if (this.blocked !== null && this.blocked !== undefined)
            res.blocked = this.blocked;

        return res;
    }
}

import { TeamModel } from './../Team/Team';
import { Permission } from '@src/auth/permissions';
import { Context } from './../../auth/context';
import { PaginateArg } from './../Pagination/Pagination';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { Profile } from './Profile';
import { profile } from 'console';
import { UserRole } from '@src/auth/UserRole';

@InputType()
export class ProfileFilter extends PaginateArg {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true, defaultValue: true })
    skip_sync?: boolean;

    @Field(() => [Permission], { nullable: true })
    has_permissions?: Permission[];

    public async serializeProfileFilter({
        roles,
    }: Context): Promise<FilterQuery<Profile>> {
        const filter: FilterQuery<Profile> = {};
        if (this.name) {
            filter.$or = [
                { name: { $regex: new RegExp(this.name, 'i') } },
                {
                    given_name: {
                        $regex: new RegExp(this.name, 'i'),
                    },
                },
                {
                    family_name: {
                        $regex: new RegExp(this.name, 'i'),
                    },
                },
                {
                    email_name: {
                        $regex: new RegExp(this.name, 'i'),
                    },
                },
            ];
        }

        if (!roles.includes(UserRole.Admin)) {
            filter.roles = UserRole.User;
        }

        if (this.has_permissions) {
            const teams = await TeamModel.find({
                permissions: { $all: this.has_permissions },
                deleted: false,
            });

            const members = teams.map((team) => team.members).flat();

            filter.user_id = { $in: members };
        }

        return filter;
    }
}

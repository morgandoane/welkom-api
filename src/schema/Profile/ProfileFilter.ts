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

    public serializeProfileFilter({ roles }: Context): FilterQuery<Profile> {
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

        return filter;
    }
}

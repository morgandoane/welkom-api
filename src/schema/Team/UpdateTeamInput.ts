import { Permission } from '@src/auth/permissions';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Company } from '../Company/Company';
import { Location } from '../Location/Location';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Team } from './Team';

@InputType()
export class UpdateTeamInput {
    @Field({ nullable: true })
    deleted?: boolean;

    @Field({ nullable: true })
    name?: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    company?: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    location?: Ref<Location> | null;

    @Field(() => [Permission], { nullable: true })
    permissions?: Permission[];

    @Field(() => [String], { nullable: true })
    members?: string[];

    public async serializeTeamUpdate(): Promise<Partial<Team>> {
        const res: Partial<Team> = {};

        if (this.deleted !== null && this.deleted !== undefined)
            res.deleted = this.deleted;
        if (this.name) res.name = this.name;
        if (this.company) res.company = this.company;
        if (this.location) res.location = this.location;
        if (this.permissions) res.permissions = this.permissions;
        if (this.members) res.members = this.members;

        return res;
    }
}

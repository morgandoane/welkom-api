import { loaderResult } from './../../utils/loaderResult';
import { UserLoader } from '@src/services/AuthProvider/AuthProvider';
import { LocationLoader } from './../Location/Location';
import { CompanyLoader } from './../Company/Company';
import { Context } from '@src/auth/context';
import { Permission } from '@src/auth/permissions';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Company } from '../Company/Company';
import { Location } from '../Location/Location';
import { Team } from './Team';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';

@InputType()
export class CreateTeamInput {
    @Field()
    name!: string;

    @Field(() => ObjectIdScalar)
    company!: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    location!: Ref<Location> | null;

    @Field(() => [Permission])
    permissions!: Permission[];

    @Field(() => [String])
    members!: string[];

    public async validateTeam(context: Context): Promise<Team> {
        await CompanyLoader.load(this.company, true);
        if (this.location) {
            await LocationLoader.load(this.location, true);
        }
        const users = await UserLoader.loadMany(this.members);
        const confirmedUsers = users.map((u) => loaderResult(u));

        return {
            ...context.base,
            ...this,
        };
    }
}

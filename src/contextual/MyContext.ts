import { CompanyLoader } from './../schema/Company/Company';
import { LocationModel } from './../schema/Location/Location';
import { TeamModel } from './../schema/Team/Team';
import { loaderResult } from './../utils/loaderResult';
import { UserLoader } from '@src/services/AuthProvider/AuthProvider';
import {
    Organization,
    OrganizationModel,
} from '@src/schema/Organization/Organization';
import { prop, Ref } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Location } from '@src/schema/Location/Location';
import { Team } from '@src/schema/Team/Team';

import Dataloader from 'dataloader';
import { Company } from '@src/schema/Company/Company';

@ObjectType()
export class MyContext {
    @Field(() => [Organization])
    @prop({ required: true, ref: () => Organization })
    organizations: Ref<Organization>[];

    @Field(() => [Team])
    @prop({ required: true, ref: () => Team })
    teams: Ref<Team>[];

    @Field(() => [Company])
    @prop({ required: true, ref: () => Company })
    companies: Ref<Company>[];

    @Field(() => [Location])
    @prop({ required: true, ref: () => Location })
    locations: Ref<Location>[];
}

export const MyContextLoader = new Dataloader<string, MyContext>(
    async (keys: readonly string[]): Promise<(MyContext | Error)[]> => {
        const res: (MyContext | Error)[] = [];

        const profiles = await UserLoader.loadMany(keys);

        for (const profile of profiles) {
            if (profile instanceof Error)
                res.push(new Error(`Failed to get context for profile`));
            else {
                const prof = loaderResult(profile);
                const teams = await TeamModel.find({
                    deleted: false,
                    members: prof.user_id,
                });

                let locations: Ref<Location>[] = [];
                const companies: Ref<Company>[] = [];

                for (const team of teams) {
                    if (team.location) locations.push(team.location);
                    const company = await CompanyLoader.load(
                        team.company,
                        true
                    );

                    companies.push(company._id);

                    if (!team.location) {
                        const companyLocations = await LocationModel.find({
                            deleted: false,
                            company: company._id,
                        });

                        locations = [
                            ...locations,
                            ...companyLocations.map((l) => l._id),
                        ];
                    }
                }

                const orgs = await OrganizationModel.find({
                    deleted: false,
                    companies: { $in: companies },
                });

                res.push({
                    teams: teams.map((t) => t._id),
                    locations,
                    organizations: orgs.map((o) => o._id),
                    companies,
                });
            }
        }

        return res;
    }
);

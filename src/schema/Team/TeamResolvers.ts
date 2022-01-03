import { UserLoader } from '@src/services/AuthProvider/AuthProvider';
import { Profile } from './../Profile/Profile';
import { Location, LocationLoader } from './../Location/Location';
import { Company, CompanyLoader } from './../Company/Company';
import { CreateTeamInput, UpdateTeamInput } from './TeamInput';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { Paginate } from '@src/schema/Paginate';
import { TeamFilter } from './TeamFilter';
import { Context } from '@src/auth/context';
import { TeamList } from './TeamList';
import { createBaseResolver } from './../Base/BaseResolvers';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
} from 'type-graphql';
import { Team, TeamModel, TeamLoader } from './Team';
import { loaderResult } from '@src/utils/loaderResult';

const BaseResolver = createBaseResolver();

@Resolver(() => Team)
export class TeamResolvers extends BaseResolver {
    @Query(() => Team)
    async team(@Arg('id', () => ObjectIdScalar) id: ObjectId): Promise<Team> {
        return loaderResult(await TeamLoader.load(id.toString()));
    }

    @Query(() => TeamList)
    async teams(@Arg('filter') filter: TeamFilter): Promise<TeamList> {
        return await Paginate.paginate({
            model: TeamModel,
            query: filter.serializeTeamFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { name: 1 },
        });
    }

    @Mutation(() => Team)
    async createTeam(
        @Ctx() context: Context,
        @Arg('data') data: CreateTeamInput
    ): Promise<Team> {
        const team = await data.serialize(context);
        const doc = await TeamModel.create(team);
        return doc.toJSON();
    }

    @Mutation(() => Team)
    async updateTeam(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data') data: UpdateTeamInput
    ): Promise<Team> {
        const team = loaderResult(await TeamLoader.load(id.toString()));

        const res = await TeamModel.findByIdAndUpdate(
            id.toString(),
            await data.serializeTeamUpdate(context),
            { new: true }
        );

        TeamLoader.clear(id.toString());

        return res.toJSON();
    }

    @FieldResolver(() => Company)
    async company(@Root() { company }: Team): Promise<Company> {
        return loaderResult(await CompanyLoader.load(company.toString()));
    }

    @FieldResolver(() => Company)
    async location(@Root() { location }: Team): Promise<Location> {
        if (!location) return null;
        return loaderResult(await LocationLoader.load(location.toString()));
    }

    @FieldResolver(() => [Profile])
    async members(@Root() { members }: Team): Promise<Profile[]> {
        const res = await UserLoader.loadMany(members);
        return res.map((r) => loaderResult(r));
    }
}

import { LocationLoader } from './../Location/Location';
import { CompanyLoader } from './../Company/Company';
import { Company } from '@src/schema/Company/Company';
import { MyContextLoader } from './../../contextual/MyContext';
import { UpdateTeamInput } from './UpdateTeamInput';
import { TeamFilter } from './TeamFilter';
import { TeamList } from './TeamList';
import { Paginate } from '../Pagination/Pagination';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { createUploadEnabledResolver } from '../UploadEnabled/UploadEnabledResolvers';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { Permitted } from '@src/auth/middleware/Permitted';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Team, TeamLoader, TeamModel } from './Team';
import { CreateTeamInput } from './CreateTeamInput';
import { UserRole } from '@src/auth/UserRole';
import { Location } from '../Location/Location';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Team)
export class TeamResolvers extends UploadEnabledResolver {
    @UseMiddleware(Permitted({ type: 'role', role: UserRole.Manager }))
    @Query(() => TeamList)
    async teams(@Arg('filter') filter: TeamFilter): Promise<TeamList> {
        return await Paginate.paginate({
            model: TeamModel,
            query: await filter.serializeTeamFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(Permitted({ type: 'role', role: UserRole.Manager }))
    @Query(() => Team)
    async team(@Arg('id', () => ObjectIdScalar) id: Ref<Team>): Promise<Team> {
        return await TeamLoader.load(id, true);
    }

    @UseMiddleware(Permitted({ type: 'role', role: UserRole.Manager }))
    @Mutation(() => Team)
    async createTeam(
        @Ctx() context: Context,
        @Arg('data', () => CreateTeamInput) data: CreateTeamInput
    ): Promise<Team> {
        const team = await data.validateTeam(context);
        const res = await TeamModel.create(team);
        for (const member of res.members) {
            MyContextLoader.clear(member);
        }
        return res.toJSON() as unknown as Team;
    }

    @UseMiddleware(Permitted({ type: 'role', role: UserRole.Manager }))
    @Mutation(() => Team)
    async updateTeam(
        @Arg('id', () => ObjectIdScalar) id: Ref<Team>,
        @Arg('data', () => UpdateTeamInput) data: UpdateTeamInput
    ): Promise<Team> {
        const res = await TeamModel.findByIdAndUpdate(
            id,
            await data.serializeTeamUpdate(),
            { new: true }
        );

        for (const member of res.members) {
            MyContextLoader.clear(member);
        }

        TeamLoader.clear(id);

        return res.toJSON() as unknown as Team;
    }

    @FieldResolver(() => Company)
    async company(@Root() { company }: Team): Promise<Company> {
        return await CompanyLoader.load(company, true);
    }

    @FieldResolver(() => Location)
    async location(@Root() { location }: Team): Promise<Location> {
        if (!location) return null;
        return await LocationLoader.load(location, true);
    }
}

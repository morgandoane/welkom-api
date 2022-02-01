import { UpdateOrganizationInput } from './UpdateOrganizationInput';
import { OrganizationFilter } from './OrganizationFilter';
import { OrganizationList } from './OrganizationList';
import { Paginate } from '../Pagination/Pagination';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { createUploadEnabledResolver } from '../UploadEnabled/UploadEnabledResolvers';
import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { Permitted } from '@src/auth/middleware/Permitted';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import {
    Organization,
    OrganizationLoader,
    OrganizationModel,
} from './Organization';
import { CreateOrganizationInput } from './CreateOrganizationInput';
import { UserRole } from '@src/auth/UserRole';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Organization)
export class OrganizationResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({
            type: 'role',
            role: UserRole.Admin,
        })
    )
    @Query(() => OrganizationList)
    async organizations(
        @Arg('filter') filter: OrganizationFilter
    ): Promise<OrganizationList> {
        return await Paginate.paginate({
            model: OrganizationModel,
            query: await filter.serializeOrganizationFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({
            type: 'role',
            role: UserRole.Admin,
        })
    )
    @Query(() => Organization)
    async organization(
        @Arg('id', () => ObjectIdScalar) id: Ref<Organization>
    ): Promise<Organization> {
        return await OrganizationLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({
            type: 'role',
            role: UserRole.Admin,
        })
    )
    @Mutation(() => Organization)
    async createOrganization(
        @Ctx() context: Context,
        @Arg('data', () => CreateOrganizationInput)
        data: CreateOrganizationInput
    ): Promise<Organization> {
        const organization = await data.validateOrganization(context);
        const res = await OrganizationModel.create(organization);
        return res;
    }

    @UseMiddleware(
        Permitted({
            type: 'role',
            role: UserRole.Admin,
        })
    )
    @Mutation(() => Organization)
    async updateOrganization(
        @Arg('id', () => ObjectIdScalar) id: Ref<Organization>,
        @Arg('data', () => UpdateOrganizationInput)
        data: UpdateOrganizationInput
    ): Promise<Organization> {
        const res = await OrganizationModel.findByIdAndUpdate(
            id,
            await data.serializeOrganizationUpdate(),
            { new: true }
        );

        OrganizationLoader.clear(id);

        return res;
    }
}

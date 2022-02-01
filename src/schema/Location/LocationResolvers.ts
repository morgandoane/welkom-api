import { Company, CompanyLoader } from './../Company/Company';
import { UpdateLocationInput } from './UpdateLocationInput';
import { LocationFilter } from './LocationFilter';
import { LocationList } from './LocationList';
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
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Location, LocationLoader, LocationModel } from './Location';
import { CreateLocationInput } from './CreateLocationInput';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Location)
export class LocationResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetLocations })
    )
    @Query(() => LocationList)
    async locations(
        @Arg('filter') filter: LocationFilter
    ): Promise<LocationList> {
        return await Paginate.paginate({
            model: LocationModel,
            query: await filter.serializeLocationFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetLocations })
    )
    @Query(() => Location)
    async location(
        @Arg('id', () => ObjectIdScalar) id: Ref<Location>
    ): Promise<Location> {
        return await LocationLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateLocation })
    )
    @Mutation(() => Location)
    async createLocation(
        @Ctx() context: Context,
        @Arg('data', () => CreateLocationInput) data: CreateLocationInput
    ): Promise<Location> {
        const Location = await data.validateLocation(context);
        const res = await LocationModel.create(Location);
        return res;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateLocation })
    )
    @Mutation(() => Location)
    async updateLocation(
        @Arg('id', () => ObjectIdScalar) id: Ref<Location>,
        @Arg('data', () => UpdateLocationInput) data: UpdateLocationInput
    ): Promise<Location> {
        const res = await LocationModel.findByIdAndUpdate(
            id,
            await data.serializeLocationUpdate(),
            { new: true }
        );

        LocationLoader.clear(id);

        return res;
    }

    @FieldResolver(() => Company)
    async company(@Root() { company }: Location): Promise<Company> {
        return await CompanyLoader.load(company, true);
    }
}

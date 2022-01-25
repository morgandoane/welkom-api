import {
    ProductionLine,
    ProductionLineLoader,
    ProductionLineModel,
} from './../ProductionLine/ProductionLine';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Context } from '@src/auth/context';
import { CreateLocationInput, UpdateLocationInput } from './LocationInput';
import { Paginate } from './../Paginate';
import { LocationFIlter } from './LocationFilter';
import { LocationList } from './LocationList';
import { loaderResult } from './../../utils/loaderResult';
import { Company, CompanyLoader } from './../Company/Company';
import { Location, LocationModel } from './Location';
import {
    Resolver,
    FieldResolver,
    Root,
    Query,
    Arg,
    Mutation,
    Ctx,
    UseMiddleware,
} from 'type-graphql';
import { createBaseResolver } from '../Base/BaseResolvers';
import { FilterQuery, ObjectId } from 'mongoose';
import { UserRole } from '@src/auth/UserRole';
import { TeamModel } from '../Team/Team';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';

const BaseResolver = createBaseResolver();

@Resolver(() => Location)
export class LocationResolvers extends BaseResolver {
    @FieldResolver(() => Company)
    async company(@Root() { company }: Location): Promise<Company> {
        return loaderResult(await CompanyLoader.load(company.toString()));
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetLocations,
        })
    )
    @Query(() => LocationList)
    async locations(
        @Ctx() context: Context,
        @Arg('filter') { skip, take, company, label, mine }: LocationFIlter
    ): Promise<LocationList> {
        const query: FilterQuery<Location> = {};

        if (label !== undefined) query.label = label;
        if (company !== undefined) query.company = company;

        if (mine !== undefined) {
            // determine companies based on assigned teams or on all teams in db
            const teams = await TeamModel.find(
                !context.roles.includes(UserRole.Admin) &&
                    !context.roles.includes(UserRole.Manager)
                    ? {
                          members: context.base.created_by,
                          deleted: false,
                      }
                    : { deleted: false }
            );

            const locationIds = [];

            for (const team of teams) {
                if (team.location) {
                    locationIds.push(team.location);
                } else {
                    const locations = await LocationModel.find({
                        deleted: false,
                        company: team.company,
                    });

                    for (const location of locations) {
                        locationIds.push(location._id);
                    }
                }
            }

            if (mine == true) {
                query.$and = [
                    ...(query.$and || []),
                    { _id: { $in: locationIds } },
                ];
            } else
                query.$and = [
                    ...(query.$and || []),
                    { _id: { $nin: locationIds } },
                ];
        }

        return await Paginate.paginate({
            model: LocationModel,
            query,
            skip,
            take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateLocation,
        })
    )
    @Mutation(() => Location)
    async createLocation(
        @Arg('data') data: CreateLocationInput,
        @Ctx() { base }: Context
    ): Promise<Location> {
        return await (
            await LocationModel.create({ ...data, ...base })
        ).toJSON();
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.UpdateLocation,
        })
    )
    @Mutation(() => Location)
    async updateLocation(
        @Arg('id', () => ObjectIdScalar) _id: ObjectId,
        @Arg('data') data: UpdateLocationInput,
        @Ctx() { base }: Context
    ): Promise<Location> {
        return await (
            await LocationModel.findOneAndUpdate(
                { _id: _id.toString() },
                { ...data },
                { upsert: true, new: true }
            )
        ).toJSON();
    }

    @FieldResolver(() => [ProductionLine])
    async production_lines(
        @Root() { _id }: Location
    ): Promise<ProductionLine[]> {
        const res = await ProductionLineModel.find({
            deleted: false,
            location: _id,
        });

        return res.map((r) => r.toJSON());
    }
}

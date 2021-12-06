import { ObjectIdScalar } from './../ObjectIdScalar';
import { Context } from '@src/auth/context';
import { LocationInput } from './LocationInput';
import { Paginate } from './../Paginate';
import { LocationFIlter } from './LocationFilter';
import { LocationList } from './LocationList';
import { loaderResult } from './../../utils/loaderResult';
import { Company, CompanyLoader } from './../Company/Company';
import { Location, LocationModel } from './Location';
import {
    Resolver,
    FieldResolver,
    ResolverInterface,
    Root,
    Query,
    Arg,
    Mutation,
    Ctx,
} from 'type-graphql';
import { createBaseResolver } from '../Base/BaseResolvers';
import { FilterQuery, ObjectId } from 'mongoose';

const BaseResolver = createBaseResolver();

@Resolver(() => Location)
export class LocationResolvers extends BaseResolver {
    @FieldResolver(() => Company)
    async company(@Root() { company }: Location): Promise<Company> {
        return loaderResult(await CompanyLoader.load(company.toString()));
    }

    @Query(() => LocationList)
    async locations(
        @Arg('filter') { skip, take, company, label }: LocationFIlter
    ): Promise<LocationList> {
        const query: FilterQuery<Location> = {};

        if (label !== undefined) query.label = label;
        if (company !== undefined) query.company = company;

        return await Paginate.paginate({
            model: LocationModel,
            query,
            skip,
            take,
            sort: { date_created: -1 },
        });
    }

    @Mutation(() => Location)
    async createLocation(
        @Arg('data') data: LocationInput,
        @Ctx() { base }: Context
    ): Promise<Location> {
        return await (
            await LocationModel.create({ ...data, ...base })
        ).toJSON();
    }

    @Mutation(() => Location)
    async updateLocation(
        @Arg('id', () => ObjectIdScalar) _id: ObjectId,
        @Arg('data') data: LocationInput,
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
}

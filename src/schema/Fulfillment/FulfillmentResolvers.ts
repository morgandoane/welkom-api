import { Item, ItemLoader } from './../Item/Item';
import { Company, CompanyLoader } from './../Company/Company';
import { UserInputError } from 'apollo-server-errors';
import { ItineraryModel } from './../Itinerary/Itinerary';
import { Context } from './../../auth/context';
import { Paginate } from './../Paginate';
import { FulfillmentFilter } from './FulfillmentFilter';
import { FulfillmentList } from './FulfillmentList';
import { Lot, LotLoader } from './../Lot/Lot';
import { FulfillmentInput, UpdateFulfillmentInput } from './FulfillmentInput';
import { Location, LocationLoader } from './../Location/Location';
import { loaderResult } from './../../utils/loaderResult';
import { Fulfillment, FulfillmentModel } from './Fulfillment';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
} from 'type-graphql';
import { createConfiguredResolver } from '../Configured/ConfiguredResolver';

const ConfiguredResolver = createConfiguredResolver();

@Resolver(() => Fulfillment)
export class FulfillmentResolvers extends ConfiguredResolver {
    @Query(() => FulfillmentList)
    async fulfillments(
        @Arg('filter') filter: FulfillmentFilter
    ): Promise<FulfillmentList> {
        return await Paginate.paginate({
            model: FulfillmentModel,
            query: filter.serializeFulfillmentFilter(),
            sort: { date_created: -1 },
            skip: filter.skip,
            take: filter.take,
        });
    }

    @Mutation(() => Fulfillment)
    async createFulfillment(
        @Ctx() context: Context,
        @Arg('data') data: FulfillmentInput
    ): Promise<Fulfillment> {
        const itinerary = await ItineraryModel.findOne({
            ['bols._id']: data.bol.toString(),
        });
        if (!itinerary) throw new UserInputError('Failed to find BOL');
        const doc = await data.validateFulfillment(context);
        const res = await FulfillmentModel.create(doc);

        return res.toJSON();
    }

    @Mutation(() => Fulfillment)
    async updateFulfillment(
        @Arg('id') id: string,
        @Arg('data') data: UpdateFulfillmentInput
    ): Promise<Fulfillment> {
        const res = await FulfillmentModel.findOneAndUpdate(
            { _id: id },
            await data.serializeFulfillmentUpdate(),
            {
                new: true,
            }
        );

        return res.toJSON();
    }

    @FieldResolver(() => Location)
    async location(@Root() { location }: Fulfillment): Promise<Location> {
        return loaderResult(await LocationLoader.load(location.toString()));
    }

    @FieldResolver(() => Company)
    async company(@Root() { company }: Fulfillment): Promise<Company> {
        return loaderResult(await CompanyLoader.load(company.toString()));
    }

    @FieldResolver(() => [Item])
    async items(@Root() { items }: Fulfillment): Promise<Item[]> {
        return await (
            await ItemLoader.loadMany(items.map((item) => item.toString()))
        ).map((result) => loaderResult(result));
    }

    @FieldResolver(() => [Lot])
    async lots(@Root() { lots }: Fulfillment): Promise<Lot[]> {
        const res = await LotLoader.loadMany(lots.map((lot) => lot.toString()));
        return res.map((result) => loaderResult(result).toJSON());
    }
}

import { Context } from './../../auth/context';
import { CreateItineraryInput } from './ItineraryInputs';
import { loaderResult } from './../../utils/loaderResult';
import { Company, CompanyLoader } from './../Company/Company';
import { Paginate } from './../Paginate';
import { ItineraryFilter } from './ItineraryFilter';
import { ItineraryList } from './ItineraryList';
import { Itinerary, ItineraryModel } from './Itinerary';
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

const ConfiguredResolvers = createConfiguredResolver();

@Resolver(() => Itinerary)
export class ItineraryResolvers extends ConfiguredResolvers {
    @Query(() => ItineraryList)
    async itineraries(
        @Arg('filter', () => ItineraryFilter) filter: ItineraryFilter
    ): Promise<ItineraryList> {
        return await Paginate.paginate({
            model: ItineraryModel,
            query: filter.serializeItineraryFilter(),
            sort: { date_created: -1 },
            skip: filter.skip,
            take: filter.take,
        });
    }

    @Mutation(() => Itinerary)
    async createItinerary(
        @Ctx() context: Context,
        @Arg('data', () => CreateItineraryInput) data: CreateItineraryInput
    ): Promise<Itinerary> {
        const doc = await data.validateItinerary(context);
        const res = await ItineraryModel.create(doc);
        return res.toJSON();
    }

    @FieldResolver(() => Company)
    async carrier(@Root() { carrier }: Itinerary): Promise<Company> {
        if (!carrier) return null;
        return loaderResult(await CompanyLoader.load(carrier.toString()));
    }
}

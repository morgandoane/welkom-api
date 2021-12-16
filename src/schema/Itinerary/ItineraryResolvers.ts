import { createBaseResolver } from './../Base/BaseResolvers';
import { Bol, BolLoader } from './../Bol/Bol';
import { Context } from './../../auth/context';
import { CreateItineraryInput, UpdateItineraryInput } from './ItineraryInputs';
import { loaderResult } from './../../utils/loaderResult';
import { Company, CompanyLoader } from './../Company/Company';
import { Paginate } from './../Paginate';
import { ItineraryFilter } from './ItineraryFilter';
import { ItineraryList } from './ItineraryList';
import { Itinerary, ItineraryModel, ItineraryLoader } from './Itinerary';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
} from 'type-graphql';

const BaseResolvers = createBaseResolver();

@Resolver(() => Itinerary)
export class ItineraryResolvers extends BaseResolvers {
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

    @Mutation(() => Itinerary)
    async updateItinerary(
        @Ctx() context: Context,
        @Arg('id') id: string,
        @Arg('data', () => UpdateItineraryInput) data: UpdateItineraryInput
    ): Promise<Itinerary> {
        const doc = loaderResult(await ItineraryLoader.load(id));
        const newDoc = await data.validateUpdate(context, doc);
        await newDoc.save();
        return newDoc;
    }

    @FieldResolver(() => Company)
    async carrier(@Root() { carrier }: Itinerary): Promise<Company> {
        if (!carrier) return null;
        return loaderResult(await CompanyLoader.load(carrier.toString()));
    }

    @FieldResolver(() => [Bol])
    async bols(
        @Root() itinerary: Itinerary,
        @Arg('show_deleted', () => Boolean, { defaultValue: false })
        show_deleted: boolean
    ): Promise<Bol[]> {
        const bols = await (
            await loaderResult(
                BolLoader.loadMany(itinerary.bols.map((b) => b.toString()))
            )
        ).map((result) => loaderResult(result));

        if (show_deleted) {
            return bols;
        } else {
            return bols.filter((bol) => bol.deleted !== true);
        }
    }
}

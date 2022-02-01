import { UpdateItineraryInput } from './UpdateItineraryInput';
import { ItineraryFilter } from './ItineraryFilter';
import { ItineraryList } from './ItineraryList';
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
import { Itinerary, ItineraryLoader, ItineraryModel } from './Itinerary';
import { CreateItineraryInput } from './CreateItineraryInput';
import { Company, CompanyLoader } from '../Company/Company';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Itinerary)
export class ItineraryResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetItineraries })
    )
    @Query(() => ItineraryList)
    async itineraries(
        @Arg('filter') filter: ItineraryFilter
    ): Promise<ItineraryList> {
        return await Paginate.paginate({
            model: ItineraryModel,
            query: await filter.serializeItineraryFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetItineraries })
    )
    @Query(() => Itinerary)
    async itinerary(
        @Arg('id', () => ObjectIdScalar) id: Ref<Itinerary>
    ): Promise<Itinerary> {
        return await ItineraryLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateItinerary,
        })
    )
    @Mutation(() => Itinerary)
    async createItinerary(
        @Ctx() context: Context,
        @Arg('data', () => CreateItineraryInput) data: CreateItineraryInput
    ): Promise<Itinerary> {
        const itinerary = await data.validateItinerary(context);
        const res = await ItineraryModel.create(itinerary);
        return res;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.UpdateItinerary,
        })
    )
    @Mutation(() => Itinerary)
    async updateItinerary(
        @Arg('id', () => ObjectIdScalar) id: Ref<Itinerary>,
        @Arg('data', () => UpdateItineraryInput) data: UpdateItineraryInput
    ): Promise<Itinerary> {
        const res = await ItineraryModel.findByIdAndUpdate(
            id,
            await data.serializeItineraryUpdate(),
            { new: true }
        );

        ItineraryLoader.clear(id);

        return res;
    }

    @FieldResolver(() => Company, { nullable: true })
    async carrier(@Root() { carrier }: Itinerary): Promise<Company> {
        if (!carrier) return null;
        return await CompanyLoader.load(carrier, true);
    }

    @FieldResolver(() => Company)
    async commissioned_by(
        @Root() { commissioned_by }: Itinerary
    ): Promise<Company> {
        return await CompanyLoader.load(commissioned_by, true);
    }
}

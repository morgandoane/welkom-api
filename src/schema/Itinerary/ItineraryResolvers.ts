import { ItinerarySchedule } from './../ItinerarySchedule/ItinerarySchedule';
import { Bol, BolModel } from './../Bol/Bol';
import { OrderLoader } from './../Order/Order';
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
import {
    Itinerary,
    ItineraryLoader,
    ItineraryModel,
    ItineraryType,
} from './Itinerary';
import { CreateItineraryInput } from './CreateItineraryInput';
import { Company, CompanyLoader } from '../Company/Company';
import { Order } from '../Order/Order';
import { BolStatus } from '../Bol/BolStatus';

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
        return res.toJSON() as unknown as Itinerary;
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

        return res.toJSON() as unknown as Itinerary;
    }

    @FieldResolver(() => Company, { nullable: true })
    async carrier(@Root() { carrier }: Itinerary): Promise<Company> {
        if (!carrier) return null;
        return await CompanyLoader.load(carrier, true);
    }

    @FieldResolver(() => Order, { nullable: true })
    async order_link(@Root() { order_link }: Itinerary): Promise<Order> {
        if (!order_link) return null;
        return await OrderLoader.load(order_link, true);
    }

    @FieldResolver(() => [Bol], { nullable: true })
    async bols(@Root() { _id: itinerary }: Itinerary): Promise<Bol[]> {
        const docs = await BolModel.find({ itinerary });
        return docs.map((doc) => doc.toJSON() as unknown as Bol);
    }

    @FieldResolver(() => ItinerarySchedule)
    async schedule(@Root() itinerary: Itinerary): Promise<ItinerarySchedule> {
        return await ItinerarySchedule.fromItinerary(itinerary);
    }
}

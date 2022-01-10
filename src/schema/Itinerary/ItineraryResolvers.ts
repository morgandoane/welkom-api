import { Order, OrderLoader } from './../Order/Order';
import { ObjectId } from 'mongoose';
import { createBaseResolver } from './../Base/BaseResolvers';
import { Bol, BolLoader, BolModel } from './../Bol/Bol';
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
    UseMiddleware,
} from 'type-graphql';
import { ObjectIdScalar } from '../ObjectIdScalar';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';

const BaseResolvers = createBaseResolver();

@Resolver(() => Itinerary)
export class ItineraryResolvers extends BaseResolvers {
    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetItineraries,
        })
    )
    @Query(() => Itinerary)
    async itinerary(
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<Itinerary> {
        return loaderResult(await ItineraryLoader.load(id.toString()));
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetItineraries,
        })
    )
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
        const doc = await data.validateItinerary(context);
        const res = await ItineraryModel.create(doc);
        return res.toJSON();
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.UpdateItinerary,
        })
    )
    @Mutation(() => Itinerary)
    async updateItinerary(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data', () => UpdateItineraryInput) data: UpdateItineraryInput
    ): Promise<Itinerary> {
        const doc = await ItineraryModel.findById(id.toString());
        const newDoc = await data.validateUpdate(context, doc);
        await newDoc.save();
        return newDoc.toJSON();
    }

    @FieldResolver(() => Company)
    async carrier(@Root() { carrier }: Itinerary): Promise<Company> {
        if (!carrier) return null;
        return loaderResult(await CompanyLoader.load(carrier.toString()));
    }

    @FieldResolver(() => [Bol])
    async bols(
        @Root() { _id }: Itinerary,
        @Arg('show_deleted', () => Boolean, { defaultValue: false })
        show_deleted: boolean
    ): Promise<Bol[]> {
        const bols = await BolModel.find({
            itinerary: _id,
            deleted: show_deleted ? undefined : false,
        });
        return bols.map((bol) => bol.toJSON());
    }

    @FieldResolver(() => [Order])
    async orders(
        @Root() { orders }: Itinerary,
        @Arg('show_deleted', () => Boolean, { defaultValue: false })
        show_deleted: boolean
    ): Promise<Order[]> {
        const orderRes = await OrderLoader.loadMany(
            orders.map((o) => o.toString())
        );
        const res = orderRes.map((result) => loaderResult(result));
        return res.filter((r) => {
            if (show_deleted == true) return r;
            else if (!r.deleted) return r;
        });
    }
}

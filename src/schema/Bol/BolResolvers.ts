import { Order, OrderLoader, OrderModel } from './../Order/Order';
import { Pagination } from './../Pagination/Pagination';
import { BolFilter } from './BolFilter';
import { BolList } from './BolList';
import { Context } from './../../auth/context';
import { createBaseResolver } from './../Base/BaseResolvers';
import {
    Fulfillment,
    FulfillmentModel,
    FulfillmentType,
} from './../Fulfillment/Fulfillment';
import {
    Itinerary,
    ItineraryLoader,
    ItineraryModel,
} from './../Itinerary/Itinerary';
import { UpdateBolInput, CreateBolInput } from './BolInput';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { LocationLoader } from './../Location/Location';
import { CompanyLoader } from './../Company/Company';
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
import { Bol, BolLoader, BolModel } from './Bol';
import { Paginate } from '../Paginate';
import { loaderResult } from '@src/utils/loaderResult';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';

const BaseResolvers = createBaseResolver();

@Resolver(() => Bol)
export class BolResolvers extends BaseResolvers {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetBols })
    )
    @Query(() => Bol)
    async bol(@Arg('id', () => ObjectIdScalar) id: ObjectId): Promise<Bol> {
        return loaderResult(await BolLoader.load(id.toString()));
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetBols })
    )
    @Query(() => BolList)
    async bols(@Arg('filter') filter: BolFilter): Promise<BolList> {
        const query = await filter.serializeBolFilter();
        const res = await Paginate.paginate({
            model: BolModel,
            query,
            sort: { date_created: -1 },
            skip: filter.skip,
            take: filter.take,
        });
        return res;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateBol })
    )
    @Mutation(() => Bol)
    async createBol(
        @Arg('data') data: CreateBolInput,
        @Ctx() context: Context
    ): Promise<Bol> {
        const res = await BolModel.create(await data.validateBol(context));
        return res.toJSON();
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateBol })
    )
    @Mutation(() => Bol)
    async updateBol(
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data') data: UpdateBolInput
    ): Promise<Bol> {
        const res = await BolModel.findByIdAndUpdate(
            id,
            await data.serializeBolUpdate(),
            { new: true }
        );

        BolLoader.clear(id.toString());

        return res.toJSON();
    }

    @FieldResolver(() => [Fulfillment])
    async shipments(
        @Root() bol: Bol,
        @Arg('show_deleted', () => Boolean, { defaultValue: false })
        show_deleted: boolean
    ): Promise<Fulfillment[]> {
        const docs = await FulfillmentModel.find({
            deleted: show_deleted ? undefined : false,
            bol: bol._id,
            type: FulfillmentType.Shipment,
        });

        return docs;
    }

    @FieldResolver(() => [Fulfillment])
    async receipts(
        @Root() bol: Bol,
        @Arg('show_deleted', () => Boolean, { defaultValue: false })
        show_deleted: boolean
    ): Promise<Fulfillment[]> {
        const docs = await FulfillmentModel.find({
            deleted: show_deleted ? undefined : false,
            bol: bol._id,
            type: FulfillmentType.Receipt,
        });

        return docs;
    }

    @FieldResolver(() => Itinerary)
    async itinerary(@Root() { itinerary }: Bol): Promise<Itinerary> {
        return loaderResult(await ItineraryLoader.load(itinerary.toString()));
    }

    @FieldResolver(() => [Order])
    async orders(@Root() { itinerary }: Bol): Promise<Order[]> {
        const itineraryDoc = loaderResult(
            await ItineraryLoader.load(itinerary.toString())
        );
        const res = await OrderModel.find({
            deleted: false,
            _id: { $in: itineraryDoc.orders.map((o) => o.toString()) },
        });

        return res.map((doc) => doc.toJSON());
    }
}

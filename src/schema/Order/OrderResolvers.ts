import { FulfillmentType } from '@src/schema/Fulfillment/Fulfillment';
import { FulfillmentModel } from './../Fulfillment/Fulfillment';
import { Itinerary, ItineraryModel } from '@src/schema/Itinerary/Itinerary';
import { ItineraryLoader } from './../Itinerary/Itinerary';
import { Bol, BolModel, BolLoader } from './../Bol/Bol';
import { CompanyLoader } from './../Company/Company';
import { Company } from '@src/schema/Company/Company';
import { Paginate } from '../Pagination/Pagination';
import { OrderFilter } from './OrderFilter';
import { OrderList } from './OrderList';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { CreateOrderInput } from './CreateOrderInput';
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
import { Order, OrderModel, OrderLoader } from './Order';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { UpdateOrderInput } from './UpdateOrderInput';
import { getId } from '@src/utils/getId';
import { BolStatus } from '../Bol/BolStatus';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Order)
export class OrderResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetOrders })
    )
    @Query(() => OrderList)
    async orders(@Arg('filter') filter: OrderFilter): Promise<OrderList> {
        return await Paginate.paginate({
            model: OrderModel,
            query: await filter.serializeOrderFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { 'appointments.date': -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetOrders })
    )
    @Query(() => Order)
    async order(
        @Arg('id', () => ObjectIdScalar) id: Ref<Order>
    ): Promise<Order> {
        return await OrderLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateOrder })
    )
    @Mutation(() => Order)
    async createOrder(
        @Ctx() context: Context,
        @Arg('data', () => CreateOrderInput) data: CreateOrderInput
    ): Promise<Order> {
        const order = await data.validateOrder(context);
        const orderRes = await OrderModel.create(order);

        const itineraries: Itinerary[] = [];
        const bols: Bol[] = [];

        const itin: Itinerary = {
            ...context.base,
            code: null,
            carrier: null,
            order_link: order._id,
            expenses: [],
        };

        itineraries.push(itin);

        for (const apt of order.appointments) {
            const bol: Bol = {
                ...context.base,
                itinerary: itin._id,
                code: null,
                contents: [],
                from: {
                    ...getId(),
                    company: order.vendor,
                    date: apt.date,
                    time: null,
                    location: null,
                },
                to: {
                    ...getId(),
                    company: order.customer,
                    date: apt.date,
                    time: apt.time,
                    location: apt.location,
                    order_appointment: apt._id,
                },
                status: BolStatus.Pending,
            };

            bols.push(bol);
        }

        await ItineraryModel.create(itineraries);
        await BolModel.create(bols);

        return orderRes.toJSON() as unknown as Order;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateOrder })
    )
    @Mutation(() => Order)
    async updateOrder(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: Ref<Order>,
        @Arg('data', () => UpdateOrderInput) data: UpdateOrderInput
    ): Promise<Order> {
        const res = await OrderModel.findByIdAndUpdate(
            id,
            await data.serializeOrderUpdate(context),
            { new: true }
        );

        const needsUpdate = await ItineraryModel.find({ order_link: res._id });

        for (const itin of needsUpdate) {
            const bols = await BolModel.find({ itinerary: itin._id });

            ItineraryLoader.clear(itin._id.toString());

            for (const bol of bols) {
                const fulfillments = await FulfillmentModel.find({
                    bol: bol._id,
                    type: FulfillmentType.Receipt,
                });

                await BolModel.findByIdAndUpdate(
                    bol._id,
                    fulfillments.length == 0
                        ? {
                              deleted: true,
                          }
                        : {
                              issue: 'This BOL was received prior to an update of the parent Order. This may cause unforseen issues.',
                          }
                );

                BolLoader.clear(bol._id.toString());

                for (const {
                    contents,
                    date,
                    location,
                    time,
                    _id: order_appointment,
                } of res.appointments) {
                    const bol: Bol = {
                        ...context.base,
                        contents,
                        itinerary: itin._id,
                        code: null,
                        from: {
                            ...getId(),
                            company: res.vendor,
                            date,
                            location,
                            time,
                        },
                        to: {
                            ...getId(),
                            company: res.customer,
                            date,
                            location,
                            time,
                            order_appointment,
                        },
                        status: BolStatus.Pending,
                    };

                    await BolModel.create(bol);
                }
            }
        }

        OrderLoader.clear(id);

        return res.toJSON() as unknown as Order;
    }

    @FieldResolver(() => Company)
    async customer(@Root() { customer }: Order): Promise<Company> {
        return await CompanyLoader.load(customer, true);
    }

    @FieldResolver(() => Company)
    async vendor(@Root() { vendor }: Order): Promise<Company> {
        return await CompanyLoader.load(vendor, true);
    }
}

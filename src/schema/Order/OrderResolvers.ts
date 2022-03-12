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
        return orderRes.toJSON() as unknown as Order;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateOrder })
    )
    @Mutation(() => Order)
    async updateOrder(
        @Arg('id', () => ObjectIdScalar) id: Ref<Order>,
        @Arg('data', () => UpdateOrderInput) data: UpdateOrderInput
    ): Promise<Order> {
        const res = await OrderModel.findByIdAndUpdate(
            id,
            await data.serializeOrderUpdate(),
            { new: true }
        );

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

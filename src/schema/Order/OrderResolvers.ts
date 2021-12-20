import { UserInputError } from 'apollo-server-errors';
import { CodeType } from '@src/services/CodeGeneration/CodeGeneration';
import { CodeGenerator } from './../../services/CodeGeneration/CodeGeneration';
import { createBaseResolver } from './../Base/BaseResolvers';
import { Company, CompanyLoader } from './../Company/Company';
import { loaderResult } from './../../utils/loaderResult';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { CreateOrderInput, UpdateOrderInput } from './OrderInputs';
import { Context } from './../../auth/context';
import { Paginate } from './../Paginate';
import { OrderFilter } from './OrderFilter';
import { OrderList } from './OrderList';
import { Order, OrderModel, OrderLoader } from './Order';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
} from 'type-graphql';
import { ObjectId } from 'mongoose';

const BaseResolvers = createBaseResolver();

@Resolver(() => Order)
export class OrderResolvers extends BaseResolvers {
    @Query(() => OrderList)
    async orders(@Arg('filter') filter: OrderFilter): Promise<OrderList> {
        const query = filter.serializeOrderFilter();
        const data = await Paginate.paginate({
            model: OrderModel,
            query,
            sort: { date_created: -1 },
            skip: filter.skip,
            take: filter.take,
        });

        return data;
    }

    @Mutation(() => Order)
    async createOrder(
        @Ctx() context: Context,
        @Arg('data') data: CreateOrderInput
    ): Promise<Order> {
        const duplicate = await CodeGenerator.isDuplicate(
            CodeType.PO,
            data.code
        );
        if (duplicate)
            throw new UserInputError(`PO code ${data.code} is already taken.`);
        return await (
            await OrderModel.create(await data.validateOrder(context))
        ).toJSON();
    }

    @Mutation(() => Order)
    async updateOrder(
        @Ctx() context: Context,
        @Arg('data') data: UpdateOrderInput,
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<Order> {
        const doc = loaderResult(await OrderLoader.load(id.toString()));
        const newDoc = await data.validateInput(context, doc);
        const res = await OrderModel.findOneAndUpdate(
            { _id: newDoc._id },
            newDoc,
            { new: true }
        );
        OrderLoader.prime(res._id.toString(), res);
        return res.toJSON();
    }

    @FieldResolver(() => Company)
    async vendor(@Root() { vendor }: Order): Promise<Company> {
        if (!vendor) return null;
        return loaderResult(await CompanyLoader.load(vendor.toString()));
    }

    @FieldResolver(() => Company)
    async customer(@Root() { customer }: Order): Promise<Company> {
        if (!customer) return null;
        return loaderResult(await CompanyLoader.load(customer.toString()));
    }
}

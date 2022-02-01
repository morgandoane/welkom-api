import { BolLoader } from './../Bol/Bol';
import { Paginate } from '../Pagination/Pagination';
import { FulfillmentFilter } from './FulfillmentFilter';
import { FulfillmentList } from './FulfillmentList';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { CreateFulfillmentInput } from './CreateFulfillmentInput';
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
import {
    Fulfillment,
    FulfillmentModel,
    FulfillmentLoader,
} from './Fulfillment';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { UpdateFulfillmentInput } from './UpdateFulfillmentInput';
import { Bol } from '../Bol/Bol';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Fulfillment)
export class FulfillmentResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetFulfillments,
        })
    )
    @Query(() => FulfillmentList)
    async fulfillments(
        @Arg('filter') filter: FulfillmentFilter
    ): Promise<FulfillmentList> {
        return await Paginate.paginate({
            model: FulfillmentModel,
            query: await filter.serializeFulfillmentFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetFulfillments,
        })
    )
    @Query(() => Fulfillment)
    async fulfillment(
        @Arg('id', () => ObjectIdScalar) id: Ref<Fulfillment>
    ): Promise<Fulfillment> {
        return await FulfillmentLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateFulfillment,
        })
    )
    @Mutation(() => Fulfillment)
    async createFulfillment(
        @Ctx() context: Context,
        @Arg('data', () => CreateFulfillmentInput) data: CreateFulfillmentInput
    ): Promise<Fulfillment> {
        const execute = await data.validateFulfillment(context);
        const fulfillmentRes = await FulfillmentModel.create(await execute());
        return fulfillmentRes;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.UpdateFulfillment,
        })
    )
    @Mutation(() => Fulfillment)
    async updateFulfillment(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: Ref<Fulfillment>,
        @Arg('data', () => UpdateFulfillmentInput) data: UpdateFulfillmentInput
    ): Promise<Fulfillment> {
        const execute = await data.validateFulfillment(context);
        const res = await FulfillmentModel.findByIdAndUpdate(
            id,
            await execute(),
            { new: true }
        );

        FulfillmentLoader.clear(id);

        return res;
    }

    @FieldResolver(() => Bol)
    async bol(@Root() { bol }: Fulfillment): Promise<Bol> {
        return await BolLoader.load(bol, true);
    }
}

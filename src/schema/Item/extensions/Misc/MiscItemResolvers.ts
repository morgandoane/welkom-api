import { Context } from '../../../../auth/context';
import { MiscItem, MiscItemLoader, MiscItemModel } from './MiscItem';
import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { createItemResolver } from '../../ItemResolver';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar/ObjectIdScalar';
import { Paginate } from '@src/schema/Pagination/Pagination';
import { Ref } from '@typegoose/typegoose';
import { MiscItemList } from './MiscItemList';
import { MiscItemFilter } from './MiscItemFilter';
import { CreateMiscItemInput } from './CreateMiscItemInput';
import { UpdateMiscItemInput } from './UpdateMiscItemInput';

const ItemResolver = createItemResolver();

@Resolver(() => MiscItem)
export class MiscItemResolvers extends ItemResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetItems })
    )
    @Query(() => MiscItemList)
    async miscItems(
        @Arg('filter') filter: MiscItemFilter
    ): Promise<MiscItemList> {
        return await Paginate.paginate({
            model: MiscItemModel,
            query: await filter.serializeMiscItemFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetItems })
    )
    @Query(() => MiscItem)
    async miscItem(
        @Arg('id', () => ObjectIdScalar) id: Ref<MiscItem>
    ): Promise<MiscItem> {
        return await MiscItemLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateItem })
    )
    @Mutation(() => MiscItem)
    async createMiscItem(
        @Ctx() context: Context,
        @Arg('data', () => CreateMiscItemInput) data: CreateMiscItemInput
    ): Promise<MiscItem> {
        const doc = await data.validateMiscItem(context);
        const res = await MiscItemModel.create(doc);
        return res;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateItem })
    )
    @Mutation(() => MiscItem)
    async updateMiscItem(
        @Arg('id', () => ObjectIdScalar) id: Ref<MiscItem>,
        @Arg('data', () => UpdateMiscItemInput) data: UpdateMiscItemInput
    ): Promise<MiscItem> {
        const res = await MiscItemModel.findByIdAndUpdate(
            id,
            await data.serializeMiscItemUpdate(),
            { new: true }
        );

        MiscItemLoader.clear(id);

        return res;
    }
}

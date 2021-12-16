import { createBaseResolver } from './../Base/BaseResolvers';
import { loaderResult } from '@src/utils/loaderResult';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar';
import { Context } from '@src/auth/context';
import { Paginate } from './../Paginate';
import { ItemFilter } from './ItemFilter';
import { ItemList } from './ItemList';
import { Item, ItemModel, ItemLoader } from './Item';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { CreateItemInput, UpdateItemInput } from './ItemInput';
import { ObjectId } from 'mongoose';

const BaseResolvers = createBaseResolver();

@Resolver(() => Item)
export class ItemResolvers extends BaseResolvers {
    @Query(() => Item)
    async item(@Arg('id', () => ObjectIdScalar) id: ObjectId): Promise<Item> {
        return loaderResult(await ItemLoader.load(id.toString()));
    }

    @Query(() => ItemList)
    async items(@Arg('filter') filter: ItemFilter): Promise<ItemList> {
        const query = filter.serializeItemFilter();

        return await Paginate.paginate({
            model: ItemModel,
            query,
            skip: filter.skip,
            take: filter.take,
            sort: { english: 1 },
        });
    }

    @Mutation(() => Item)
    async createItem(
        @Arg('data') data: CreateItemInput,
        @Ctx() context: Context
    ): Promise<Item> {
        return await ItemModel.create({ ...context.base, ...data });
    }

    @Mutation(() => Item)
    async updateItem(
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data') data: UpdateItemInput,
        @Ctx() context: Context
    ): Promise<Item> {
        return await ItemModel.findByIdAndUpdate(
            id,
            data.serializeItemUpdate(context),
            { new: true }
        );
    }
}

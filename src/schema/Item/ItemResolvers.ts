import { createBaseResolver } from './../Base/BaseResolvers';
import { loaderResult } from '@src/utils/loaderResult';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar';
import { Context } from '@src/auth/context';
import { Paginate } from './../Paginate';
import { ItemFilter } from './ItemFilter';
import { ItemList } from './ItemList';
import { Item, ItemModel, ItemLoader } from './Item';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
} from 'type-graphql';
import { CreateItemInput, UpdateItemInput } from './ItemInput';
import { ObjectId } from 'mongoose';
import { AppFile } from '../AppFile/AppFile';
import { StorageBucket } from '@src/services/CloudStorage/CloudStorage';

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
        return await (
            await ItemModel.create({ ...context.base, ...data })
        ).toJSON();
    }

    @Mutation(() => Item)
    async updateItem(
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data') data: UpdateItemInput,
        @Ctx() context: Context
    ): Promise<Item> {
        const update = data.serializeItemUpdate(context);
        const item = await ItemModel.findById(id.toString());
        item.date_modified = update.date_modified;
        item.modified_by = update.modified_by;

        if (update.english) item.english = update.english;
        if (update.spanish) item.spanish = update.spanish;
        if (update.unit_class) item.unit_class = update.unit_class;
        if (update.deleted !== undefined) item.deleted = update.deleted;

        ItemLoader.clear(id.toString());

        await item.save();

        return item.toJSON();
    }

    @FieldResolver(() => [AppFile])
    async files(
        @Ctx() { storage }: Context,
        @Root() { _id }: Item
    ): Promise<AppFile[]> {
        const files = await storage.files(
            StorageBucket.Attachments,
            _id.toString()
        );

        return files.map((file) => AppFile.fromFile(file, _id.toString()));
    }
}

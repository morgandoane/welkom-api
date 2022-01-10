import { UnitLoader, Unit } from './../Unit/Unit';
import { CompanyLoader } from './../Company/Company';
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
    UseMiddleware,
} from 'type-graphql';
import { CreateItemInput, UpdateItemInput } from './ItemInput';
import { ObjectId } from 'mongoose';
import { AppFile } from '../AppFile/AppFile';
import { StorageBucket } from '@src/services/CloudStorage/CloudStorage';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { Company } from '../Company/Company';

const BaseResolvers = createBaseResolver();

@Resolver(() => Item)
export class ItemResolvers extends BaseResolvers {
    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetItems,
        })
    )
    @Query(() => Item)
    async item(@Arg('id', () => ObjectIdScalar) id: ObjectId): Promise<Item> {
        return loaderResult(await ItemLoader.load(id.toString()));
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetItems,
        })
    )
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

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateItem,
        })
    )
    @Mutation(() => Item)
    async createItem(
        @Arg('data') data: CreateItemInput,
        @Ctx() context: Context
    ): Promise<Item> {
        const res = await ItemModel.create(
            await data.validateItemInput(context)
        );
        return res.toJSON() as unknown as Item;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.UpdateItem,
        })
    )
    @Mutation(() => Item)
    async updateItem(
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data') data: UpdateItemInput,
        @Ctx() context: Context
    ): Promise<Item> {
        const update = await data.serializeItemUpdate(context);
        const item = await ItemModel.findById(id.toString());
        item.date_modified = update.date_modified;
        item.modified_by = update.modified_by;

        if (update.english) item.english = update.english;
        if (update.spanish) item.spanish = update.spanish;
        if (update.default_unit) item.default_unit = update.default_unit;
        if (update.default_vendor) item.default_vendor = update.default_vendor;
        if (update.unit_class) item.unit_class = update.unit_class;
        if (update.deleted !== undefined) item.deleted = update.deleted;

        ItemLoader.clear(id.toString());

        await item.save();

        return item.toJSON() as unknown as Item;
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

    @FieldResolver(() => Company)
    async default_vendor(@Root() { default_vendor }: Item): Promise<Company> {
        if (!default_vendor) return null;
        else
            return loaderResult(
                await CompanyLoader.load(default_vendor.toString())
            );
    }

    @FieldResolver(() => Unit)
    async default_unit(@Root() { default_unit }: Item): Promise<Unit> {
        if (!default_unit) return null;
        else
            return loaderResult(await UnitLoader.load(default_unit.toString()));
    }
}

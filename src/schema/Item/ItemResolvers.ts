import { loaderResult } from './../../utils/loaderResult';
import { ItemClass, ItemClassLoader } from './../ItemClass/ItemClass';
import { Context } from '@src/auth/context';
import { Paginate } from './../Paginate';
import { ItemFilter } from './ItemFilter';
import { ItemList } from './ItemList';
import { createConfiguredResolver } from './../Configured/ConfiguredResolver';
import { Item, ItemModel } from './Item';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
} from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType, mongoose } from '@typegoose/typegoose';
import { CreateItemInput, UpdateItemInpiut } from './ItemInput';

const ConfiguredResolver = createConfiguredResolver();

@Resolver(() => Item)
export class ItemResolvers extends ConfiguredResolver {
    @Query(() => ItemList)
    async items(
        @Arg('filter') { skip, take, name, class: item_class }: ItemFilter
    ): Promise<ItemList> {
        const query: FilterQuery<DocumentType<Item>> = {};

        if (name !== undefined)
            query.name = {
                $regex: new RegExp(name, 'i'),
            };

        if (item_class !== undefined) query.item_class = item_class;

        return await Paginate.paginate({
            model: ItemModel,
            query,
            skip,
            take,
            sort: { english: 1 },
        });
    }

    @Mutation(() => Item)
    async createItem(
        @Arg('data') data: CreateItemInput,
        @Ctx() context: Context
    ): Promise<Item> {
        const configured = await data.validate(context);
        const doc: Item = {
            ...configured,
            english: data.english,
            spanish: data.spanish,
            item_class: new mongoose.Types.ObjectId(data.item_class.toString()),
            unit_class: data.unit_class,
        };
        return await (await ItemModel.create(doc)).toJSON();
    }

    @Mutation(() => Item)
    async updateItem(
        @Arg('id') id: string,
        @Arg('data') data: UpdateItemInpiut,
        @Ctx() context: Context
    ): Promise<Item> {
        const configured = await data.validate(context);
        const doc = await ItemModel.findById(id);
        doc.field_values = configured.field_values;
        doc.config = configured.config;
        if (data.english !== undefined) doc.english = data.english;
        if (data.spanish !== undefined) doc.spanish = data.spanish;
        if (data.deleted !== undefined) doc.deleted = data.deleted;
        await doc.save();
        return doc.toJSON();
    }

    @FieldResolver(() => ItemClass)
    async item_class(@Root() { item_class }: Item): Promise<ItemClass> {
        return loaderResult(await ItemClassLoader.load(item_class.toString()));
    }
}

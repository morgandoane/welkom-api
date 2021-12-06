import { Context } from '@src/auth/context';
import { ItemClassInput } from './ItemClassInput';
import { ItemClassFilter } from './ItemClassFilter';
import { ItemClassList } from './ItemClassList';
import { ItemClass, ItemClassModel } from './ItemClass';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { createBaseResolver } from '../Base/BaseResolvers';
import { Paginate } from '../Paginate';
import { ConfigKey } from '../Config/Config';

const BaseResolver = createBaseResolver();

@Resolver(() => ItemClass)
export class ItemClassResolver extends BaseResolver {
    @Query(() => ItemClassList)
    async itemClasses(
        @Arg('filter') { skip, take, deleted }: ItemClassFilter
    ): Promise<ItemClassList> {
        return await Paginate.paginate({
            model: ItemClassModel,
            query: deleted == undefined ? {} : { deleted },
            sort: { date_created: -1 },
            skip,
            take,
        });
    }

    @Mutation(() => ItemClass)
    async createItemClass(
        @Arg('data') { name, fields }: ItemClassInput,
        @Ctx() { base }: Context
    ): Promise<ItemClass> {
        await ItemClassModel.updateMany(
            { key: ConfigKey.Item, name },
            { deleted: true }
        );
        const doc: ItemClass = {
            ...base,
            key: ConfigKey.Item,
            name,
            fields: fields.map((field) => field.validate()),
        };
        await ItemClassModel.create(doc, (err, newDoc) => {
            if (err) throw new Error('Failed to create Item Class.');
        });
        return doc;
    }

    @Mutation(() => Boolean)
    async renameItemClass(
        @Arg('old_name') old_name: string,
        @Arg('new_name') new_name: string,
        @Ctx() { base }: Context
    ): Promise<boolean> {
        await ItemClassModel.updateMany(
            {
                key: ConfigKey.Item,
                name: old_name,
            },
            {
                name: new_name,
                modified_by: base.modified_by,
                date_modified: base.date_modified,
            }
        );

        return true;
    }
}

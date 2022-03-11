import { ItemFilter } from './ItemFilter';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { Arg, Query, Resolver, UseMiddleware } from 'type-graphql';
import { Paginate } from '../Pagination/Pagination';
import { UploadEnabled } from '../UploadEnabled/UploadEnabled';
import { createUploadEnabledResolver } from '../UploadEnabled/UploadEnabledResolvers';
import { ItemList } from './ItemList';
import { ItemModel } from './Item';

export const createItemResolver = () => {
    const UploadEnabledResolver = createUploadEnabledResolver();

    @Resolver(() => UploadEnabled, { isAbstract: true })
    abstract class ItemResolver extends UploadEnabledResolver {
        @UseMiddleware(
            Permitted({
                type: 'permission',
                permission: Permission.GetItems,
            })
        )
        @Query(() => ItemList)
        async items(
            @Arg('filter', () => ItemFilter) filter: ItemFilter
        ): Promise<ItemList> {
            return await Paginate.paginate({
                model: ItemModel,
                query: await filter.serializeItemFilter(),
                skip: filter.skip,
                take: filter.take,
                sort: { 'names.english': 1 },
            });
        }
    }

    return ItemResolver;
};

export const ItemResolver = createItemResolver();

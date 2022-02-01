import { Context } from '../../../../auth/context';
import { Packaging, PackagingLoader, PackagingModel } from './Packaging';
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
import { PackagingList } from './PackagingList';
import { PackagingFilter } from './PackagingFilter';
import { CreatePackagingInput } from './CreatePackagingInput';
import { UpdatePackagingInput } from './UpdatePackagingInput';

const ItemResolver = createItemResolver();

@Resolver(() => Packaging)
export class PackagingResolvers extends ItemResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetItems })
    )
    @Query(() => PackagingList)
    async packagings(
        @Arg('filter') filter: PackagingFilter
    ): Promise<PackagingList> {
        return await Paginate.paginate({
            model: PackagingModel,
            query: await filter.serializePackagingFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetItems })
    )
    @Query(() => Packaging)
    async packaging(
        @Arg('id', () => ObjectIdScalar) id: Ref<Packaging>
    ): Promise<Packaging> {
        return await PackagingLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateItem })
    )
    @Mutation(() => Packaging)
    async createPackaging(
        @Ctx() context: Context,
        @Arg('data', () => CreatePackagingInput) data: CreatePackagingInput
    ): Promise<Packaging> {
        const doc = await data.validatePackaging(context);
        const res = await PackagingModel.create(doc);
        return res;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateItem })
    )
    @Mutation(() => Packaging)
    async updatePackaging(
        @Arg('id', () => ObjectIdScalar) id: Ref<Packaging>,
        @Arg('data', () => UpdatePackagingInput) data: UpdatePackagingInput
    ): Promise<Packaging> {
        const res = await PackagingModel.findByIdAndUpdate(
            id,
            await data.serializePackagingUpdate(),
            { new: true }
        );

        PackagingLoader.clear(id);

        return res;
    }
}

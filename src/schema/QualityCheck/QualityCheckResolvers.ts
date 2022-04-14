import { Context } from '@src/auth/context';
import {
    CreateQualityCheckInput,
    UpdateQualityCheckInput,
} from './QualityCheckInput';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { Paginate } from '@src/schema/Paginate';
import { QualityCheckFilter } from './QualityCheckFilter';
import { QualityCheckList } from './QualityCheckList';
import { Item, ItemLoader } from './../Item/Item';
import {
    QualityCheck,
    QualityCheckModel,
    QualityCheckLoader,
} from './QualityCheck';
import {
    Arg,
    FieldResolver,
    Query,
    Resolver,
    Root,
    Mutation,
    Ctx,
    UseMiddleware,
} from 'type-graphql';
import { createBaseResolver } from './../Base/BaseResolvers';
import { loaderResult } from '@src/utils/loaderResult';
import { Permission } from '@src/auth/permissions';
import { Permitted } from '@src/auth/middleware/Permitted';

const BaseResolver = createBaseResolver();

@Resolver(() => QualityCheck)
export class QualityCheckResolvers extends BaseResolver {
    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetQualityChecks,
        })
    )
    @Query(() => QualityCheck)
    async qualityCheck(
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<QualityCheck> {
        return loaderResult(await QualityCheckLoader.load(id.toString()));
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetQualityChecks,
        })
    )
    @Query(() => QualityCheckList)
    async qualityChecks(
        @Arg('filter', () => QualityCheckFilter) filter: QualityCheckFilter
    ): Promise<QualityCheckList> {
        return await Paginate.paginate({
            model: QualityCheckModel,
            query: await filter.serializeCheckFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateQualityCheck,
        })
    )
    @Mutation(() => QualityCheck)
    async createQualityCheck(
        @Ctx() context: Context,
        @Arg('data', () => CreateQualityCheckInput)
        data: CreateQualityCheckInput
    ): Promise<QualityCheck> {
        const doc = await QualityCheckModel.create(
            await data.validate(context)
        );

        return doc.toJSON() as unknown as QualityCheck;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.UpdateQualityCheck,
        })
    )
    @Mutation(() => QualityCheck)
    async updateQualityCheck(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data', () => UpdateQualityCheckInput)
        data: UpdateQualityCheckInput
    ): Promise<QualityCheck> {
        const res = await QualityCheckModel.findByIdAndUpdate(
            id,
            await data.validate(context),
            { new: true }
        );

        return res.toJSON() as unknown as QualityCheck;
    }

    @FieldResolver(() => Item)
    async item(@Root() { item }: QualityCheck): Promise<Item> {
        return loaderResult(await ItemLoader.load(item.toString()));
    }
}

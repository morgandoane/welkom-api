import { createBaseResolver } from './../../../Base/BaseResolvers';
import { BucketLotInput, UpdateBucketLotInput } from './BucketLotInput';
import { BucketLotFilter } from './BucketLotFilter';
import { Pagination } from '@src/schema/Pagination/Pagination';
import { BucketLot, BucketLotLoader, BucketLotModel } from './BucketLot';
import { Arg, Query, Resolver, ObjectType, Mutation, Ctx } from 'type-graphql';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { loaderResult } from '@src/utils/loaderResult';
import { Paginate } from '@src/schema/Paginate';
import { Context } from '@src/auth/context';

const BaseResolvers = createBaseResolver();

@ObjectType()
export class BucketLotList extends Pagination(BucketLot) {}

@Resolver(() => BucketLot)
export class BucketLotResolvers extends BaseResolvers {
    @Query(() => BucketLot)
    async bucketLot(
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<BucketLot> {
        return loaderResult(await BucketLotLoader.load(id.toString()));
    }

    @Query(() => BucketLotList)
    async bucketLots(
        @Arg('filter') filter: BucketLotFilter
    ): Promise<BucketLotList> {
        const query = filter.serializeBucketLotFilter();

        return await Paginate.paginate({
            model: BucketLotModel,
            query,
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @Mutation(() => BucketLot)
    async createBucketLot(
        @Arg('data') data: BucketLotInput,
        @Ctx() context: Context
    ): Promise<BucketLot> {
        const doc = await data.validateBucketLot(context);
        const res = await BucketLotModel.create(doc);
        return res.toJSON() as unknown as BucketLot;
    }

    @Mutation(() => BucketLot)
    async updateBucketLot(
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data') data: UpdateBucketLotInput,
        @Ctx() context: Context
    ): Promise<BucketLot> {
        const res = await BucketLotModel.findByIdAndUpdate(
            id,
            await data.validateBucketLotUpdate(context),
            { new: true }
        ).catch((e) => {
            throw new Error(e);
        });

        return res;
    }
}

import { createBaseResolver } from './../../../Base/BaseResolvers';
import {
    ProceduralLotInput,
    UpdateProceduralLotInput,
} from './ProceduralLotInput';
import { ProceduralLotFilter } from './ProceduralLotFilter';
import { Pagination } from '@src/schema/Pagination/Pagination';
import {
    ProceduralLot,
    ProceduralLotLoader,
    ProceduralLotModel,
} from './ProceduralLot';
import { Arg, Query, Resolver, ObjectType, Mutation, Ctx } from 'type-graphql';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { loaderResult } from '@src/utils/loaderResult';
import { Paginate } from '@src/schema/Paginate';
import { Context } from '@src/auth/context';

const BaseResolvers = createBaseResolver();

@ObjectType()
export class ProceduralLotList extends Pagination(ProceduralLot) {}

@Resolver(() => ProceduralLot)
export class ProceduralLotResolvers extends BaseResolvers {
    @Query(() => ProceduralLot)
    async proceduralLot(
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<ProceduralLot> {
        return loaderResult(await ProceduralLotLoader.load(id.toString()));
    }

    @Query(() => ProceduralLotList)
    async proceduralLots(
        @Arg('filter') filter: ProceduralLotFilter
    ): Promise<ProceduralLotList> {
        const query = filter.serializeProceduralLotFilter();

        return await Paginate.paginate({
            model: ProceduralLotModel,
            query,
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @Mutation(() => ProceduralLot)
    async createProceduralLot(
        @Arg('data') data: ProceduralLotInput,
        @Ctx() context: Context
    ): Promise<ProceduralLot> {
        const doc = await data.validateProceduralLot(context);
        const res = await ProceduralLotModel.create(doc);
        return res.toJSON();
    }

    @Mutation(() => ProceduralLot)
    async updateProceduralLot(
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data') data: UpdateProceduralLotInput,
        @Ctx() context: Context
    ): Promise<ProceduralLot> {
        const res = await ProceduralLotModel.findByIdAndUpdate(
            id,
            await data.validateProceduralLotUpdate(context),
            { new: true }
        ).catch((e) => {
            throw new Error(e);
        });

        return res;
    }
}

import { Permitted } from '@src/auth/middleware/Permitted';
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
import {
    Arg,
    Query,
    Resolver,
    ObjectType,
    Mutation,
    Ctx,
    UseMiddleware,
} from 'type-graphql';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { loaderResult } from '@src/utils/loaderResult';
import { Paginate } from '@src/schema/Paginate';
import { Context } from '@src/auth/context';
import { Permission } from '@src/auth/permissions';

const BaseResolvers = createBaseResolver();

@ObjectType()
export class ProceduralLotList extends Pagination(ProceduralLot) {}

@Resolver(() => ProceduralLot)
export class ProceduralLotResolvers extends BaseResolvers {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetLots })
    )
    @Query(() => ProceduralLot)
    async proceduralLot(
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<ProceduralLot> {
        return loaderResult(await ProceduralLotLoader.load(id.toString()));
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetLots })
    )
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

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateLot })
    )
    @Mutation(() => ProceduralLot)
    async createProceduralLot(
        @Arg('data') data: ProceduralLotInput,
        @Ctx() context: Context
    ): Promise<ProceduralLot> {
        const doc = await data.validateProceduralLot(context);
        const res = await ProceduralLotModel.create(doc);
        return res.toJSON();
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateLot })
    )
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

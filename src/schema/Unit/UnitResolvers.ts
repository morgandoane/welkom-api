import { UpdateUnitInput } from './UpdateUnitInput';
import { UnitFilter } from './UnitFilter';
import { UnitList } from './UnitList';
import { Paginate } from '../Pagination/Pagination';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { createUploadEnabledResolver } from '../UploadEnabled/UploadEnabledResolvers';
import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Unit, UnitLoader, UnitModel } from './Unit';
import { CreateUnitInput } from './CreateUnitInput';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Unit)
export class UnitResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetUnits })
    )
    @Query(() => UnitList)
    async units(@Arg('filter') filter: UnitFilter): Promise<UnitList> {
        return await Paginate.paginate({
            model: UnitModel,
            query: await filter.serializeUnitFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetUnits })
    )
    @Query(() => Unit)
    async unit(@Arg('id', () => ObjectIdScalar) id: Ref<Unit>): Promise<Unit> {
        return await UnitLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateUnit })
    )
    @Mutation(() => Unit)
    async createUnit(
        @Ctx() context: Context,
        @Arg('data', () => CreateUnitInput) data: CreateUnitInput
    ): Promise<Unit> {
        const unit = await data.validateUnit(context);
        const res = await UnitModel.create(unit);
        return res;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateUnit })
    )
    @Mutation(() => Unit)
    async updateUnit(
        @Arg('id', () => ObjectIdScalar) id: Ref<Unit>,
        @Arg('data', () => UpdateUnitInput) data: UpdateUnitInput
    ): Promise<Unit> {
        const res = await UnitModel.findByIdAndUpdate(
            id,
            await data.serializeUnitUpdate(),
            { new: true }
        );

        UnitLoader.clear(id);

        return res;
    }
}

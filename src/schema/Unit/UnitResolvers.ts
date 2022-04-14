import { UserInputError } from 'apollo-server-errors';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { loaderResult } from './../../utils/loaderResult';
import { Context } from './../../auth/context';
import { CreateUnitInput, UpdateUnitInput } from './UnitInputs';
import { Paginate } from './../Paginate';
import { UnitFilter } from './UnitFilter';
import { UnitList } from './UnitList';
import { Unit, UnitModel, UnitLoader } from './Unit';
import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { createBaseResolver } from '../Base/BaseResolvers';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';

const BaseResolvers = createBaseResolver();

@Resolver(() => Unit)
export class UnitResolvers extends BaseResolvers {
    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetUnits,
        })
    )
    @Query(() => Unit)
    async unit(@Arg('id', () => ObjectIdScalar) id: ObjectId): Promise<Unit> {
        return loaderResult(await UnitLoader.load(id.toString()));
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetUnits,
        })
    )
    @Query(() => UnitList)
    async units(@Arg('filter') filter: UnitFilter): Promise<UnitList> {
        return await Paginate.paginate({
            model: UnitModel,
            query: filter.serializeUnitFilter(),
            sort: { english: 1 },
            skip: filter.skip,
            take: filter.take,
        });
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateUnit,
        })
    )
    @Mutation(() => Unit)
    async createUnit(
        @Ctx() { base }: Context,
        @Arg('data') data: CreateUnitInput
    ): Promise<Unit> {
        const doc: Unit = { ...base, ...data };
        return (await (
            await UnitModel.create(doc)
        ).toJSON()) as unknown as Unit;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.UpdateUnit,
        })
    )
    @Mutation(() => Unit)
    async updateUnit(
        @Ctx() { base }: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data', () => UpdateUnitInput) data: UpdateUnitInput
    ): Promise<Unit> {
        const doc = await UnitModel.findById(id.toString());
        if (!doc) throw new UserInputError('Could not find unit with id ' + id);
        if (data.class) doc.class = data.class;
        if (data.english) doc.english = data.english;
        if (data.english_plural) doc.english_plural = data.english_plural;
        if (data.spanish) doc.spanish = data.spanish;
        if (data.spanish_plural) doc.spanish_plural = data.spanish_plural;
        if (data.base_per_unit) doc.base_per_unit = data.base_per_unit;
        if (data.deleted !== undefined && data.deleted !== null)
            doc.deleted = data.deleted;
        doc.date_modified = base.date_modified;
        doc.modified_by = base.modified_by;
        UnitLoader.clear(doc._id.toString());
        await doc.save();
        return doc.toJSON() as unknown as Unit;
    }
}

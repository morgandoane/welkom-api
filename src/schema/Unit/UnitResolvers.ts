import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { loaderResult } from './../../utils/loaderResult';
import { Context } from './../../auth/context';
import { CreateUnitInput, UpdateUnitInput } from './UnitInputs';
import { Paginate } from './../Paginate';
import { UnitFilter } from './UnitFilter';
import { UnitList } from './UnitList';
import { Unit, UnitModel, UnitLoader } from './Unit';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { createBaseResolver } from '../Base/BaseResolvers';

const BaseResolvers = createBaseResolver();

@Resolver(() => Unit)
export class UnitResolvers extends BaseResolvers {
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

    @Mutation(() => Unit)
    async createUnit(
        @Ctx() { base }: Context,
        @Arg('data') data: CreateUnitInput
    ): Promise<Unit> {
        const doc: Unit = { ...base, ...data };
        return await (await UnitModel.create(doc)).toJSON();
    }

    @Mutation(() => Unit)
    async updateUnit(
        @Ctx() { base }: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data', () => UpdateUnitInput) data: UpdateUnitInput
    ): Promise<Unit> {
        const doc = loaderResult(await UnitLoader.load(id.toString()));
        if (data.class) doc.class = data.class;
        if (data.english) doc.english = data.english;
        if (data.english_plural) doc.english_plural = data.english_plural;
        if (data.spanish) doc.spanish = data.spanish;
        if (data.spanish_plural) doc.spanish_plural = data.spanish_plural;
        if (data.deleted !== undefined && data.deleted !== null)
            doc.deleted = data.deleted;
        doc.date_modified = base.date_modified;
        doc.modified_by = base.modified_by;
        await doc.save();
        return doc;
    }
}

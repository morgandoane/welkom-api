import { LotLoader } from './../Lot/Lot';
import { UpdateHoldInput } from './UpdateHoldInput';
import { HoldFilter } from './HoldFilter';
import { HoldList } from './HoldList';
import { Paginate } from '../Pagination/Pagination';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { createUploadEnabledResolver } from '../UploadEnabled/UploadEnabledResolvers';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { Permitted } from '@src/auth/middleware/Permitted';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Hold, HoldLoader, HoldModel } from './Hold';
import { CreateHoldInput } from './CreateHoldInput';
import { UserRole } from '@src/auth/UserRole';
import { Lot } from '../Lot/Lot';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Hold)
export class HoldResolvers extends UploadEnabledResolver {
    @UseMiddleware(Permitted({ type: 'role', role: UserRole.Manager }))
    @Query(() => HoldList)
    async holds(@Arg('filter') filter: HoldFilter): Promise<HoldList> {
        return await Paginate.paginate({
            model: HoldModel,
            query: await filter.serializeHoldFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(Permitted({ type: 'role', role: UserRole.Manager }))
    @Query(() => Hold)
    async hold(@Arg('id', () => ObjectIdScalar) id: Ref<Hold>): Promise<Hold> {
        return await HoldLoader.load(id, true);
    }

    @UseMiddleware(Permitted({ type: 'role', role: UserRole.Manager }))
    @Mutation(() => Hold)
    async createHold(
        @Ctx() context: Context,
        @Arg('data', () => CreateHoldInput) data: CreateHoldInput
    ): Promise<Hold> {
        const hold = await data.validateHold(context);
        const res = await HoldModel.create(hold);
        return res;
    }

    @UseMiddleware(Permitted({ type: 'role', role: UserRole.Manager }))
    @Mutation(() => Hold)
    async updateHold(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: Ref<Hold>,
        @Arg('data', () => UpdateHoldInput) data: UpdateHoldInput
    ): Promise<Hold> {
        const res = await HoldModel.findByIdAndUpdate(
            id,
            await data.serializeHoldUpdate(context),
            { new: true }
        );

        HoldLoader.clear(id);

        return res;
    }

    @FieldResolver(() => [Lot])
    async lots(@Root() { lots }: Hold): Promise<Lot[]> {
        return await LotLoader.loadMany(lots, true);
    }
}

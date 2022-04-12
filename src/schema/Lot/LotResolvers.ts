import { Location, LocationLoader } from './../Location/Location';
import { Company, CompanyLoader } from './../Company/Company';
import {
    ProductionLine,
    ProductionLineLoader,
} from './../ProductionLine/ProductionLine';
import { Item, ItemLoader } from '@src/schema/Item/Item';
import { ExpenseClass } from './../Expense/ExpenseClass';
import { Paginate } from '../Pagination/Pagination';
import { LotFilter } from './LotFilter';
import { LotList } from './LotList';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { CreateLotInput } from './CreateLotInput';
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
import { Lot, LotModel, LotLoader } from './Lot';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { UpdateLotInput } from './UpdateLotInput';
import { ExpenseModifier } from '../Expense/ExpenseModifider';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Lot)
export class LotResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetLots })
    )
    @Query(() => LotList)
    async lots(@Arg('filter') filter: LotFilter): Promise<LotList> {
        return await Paginate.paginate({
            model: LotModel,
            query: await filter.serializeLotFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetLots })
    )
    @Query(() => Lot)
    async lot(@Arg('id', () => ObjectIdScalar) id: Ref<Lot>): Promise<Lot> {
        return await LotLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateLot })
    )
    @Mutation(() => Lot)
    async createLot(
        @Ctx() context: Context,
        @Arg('data', () => CreateLotInput) data: CreateLotInput
    ): Promise<Lot> {
        const doc = await data.validateLot(context);
        const res = await LotModel.create(doc);

        await ExpenseModifier[ExpenseClass.Lot](doc._id);

        return res;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateLot })
    )
    @Mutation(() => Lot)
    async updateLot(
        @Arg('id', () => ObjectIdScalar) id: Ref<Lot>,
        @Arg('data', () => UpdateLotInput) data: UpdateLotInput
    ): Promise<Lot> {
        const res = await LotModel.findByIdAndUpdate(
            id,
            await data.serializeLotUpdate(),
            { new: true }
        );

        await ExpenseModifier[ExpenseClass.Lot](res._id);

        return res;
    }

    @FieldResolver(() => Item)
    async item(@Root() { item }: Lot): Promise<Item> {
        return await ItemLoader.load(item, true);
    }

    @FieldResolver(() => ProductionLine)
    async production_line(
        @Root() { production_line }: Lot
    ): Promise<ProductionLine> {
        if (!production_line) return null;
        return await ProductionLineLoader.load(production_line, true);
    }

    @FieldResolver(() => Company)
    async company(@Root() { company }: Lot): Promise<Company> {
        return await CompanyLoader.load(company, true);
    }

    @FieldResolver(() => Location)
    async location(@Root() { location }: Lot): Promise<Location> {
        if (!location) return null;
        return await LocationLoader.load(location, true);
    }
}

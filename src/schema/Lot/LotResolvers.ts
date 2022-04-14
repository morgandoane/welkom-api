import { LotFinder } from './LotFinder';
import { Permitted } from '@src/auth/middleware/Permitted';
import { createBaseResolver } from './../Base/BaseResolvers';
import { Location, LocationLoader } from './../Location/Location';
import { loaderResult } from './../../utils/loaderResult';
import { Item, ItemLoader } from './../Item/Item';
import { Company, CompanyLoader } from './../Company/Company';
import { Lot, LotModel } from './Lot';
import {
    Arg,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { Expense, ExpenseModel } from '../Expense/Expense';
import { Permission } from '@src/auth/permissions';

const BaseResolvers = createBaseResolver();

@Resolver(() => Lot)
export class LotResolvers extends BaseResolvers {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetLots })
    )
    @Query(() => Lot, { nullable: true })
    async findLot(
        @Arg('filter', () => LotFinder) filter: LotFinder
    ): Promise<Lot> {
        const query = await filter.serialize();
        const doc = await LotModel.findOne({ ...query });
        if (!doc) return null;
        else return doc.toJSON() as unknown as Lot;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetLots })
    )
    @Query(() => [Lot])
    async findLots(
        @Arg('filter', () => LotFinder) filter: LotFinder
    ): Promise<Lot[]> {
        const query = await filter.serialize();
        const docs = await LotModel.find({ ...query });
        return docs.map((doc) => doc.toJSON() as unknown as Lot);
    }

    @FieldResolver(() => Item)
    async item(@Root() lot: Lot): Promise<Item> {
        return loaderResult(await ItemLoader.load(lot.item.toString()));
    }

    @FieldResolver(() => Company)
    async company(@Root() { company }: Lot): Promise<Company> {
        if (!company) return null;
        return loaderResult(await CompanyLoader.load(company.toString()));
    }

    @FieldResolver(() => Location)
    async location(@Root() { location }: Lot): Promise<Location> {
        if (!location) return null;
        return loaderResult(await LocationLoader.load(location.toString()));
    }

    @FieldResolver(() => [Expense])
    async expenses(@Root() { _id }: Lot): Promise<Expense[]> {
        const res = await ExpenseModel.find({
            against: _id.toString(),
            deleted: false,
        });
        return res.map((doc) => doc.toJSON() as unknown as Expense);
    }
}

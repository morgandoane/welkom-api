import { FulfillmentModel } from './../Fulfillment/Fulfillment';
import { BolModel } from './../Bol/Bol';
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
    @Mutation(() => Boolean)
    async cleanUpLots(): Promise<boolean> {
        const matches = await LotModel.find({
            fulfillment_type: { $exists: true },
        });

        let count = 0;

        for (const match of matches) {
            const fulfillment = await FulfillmentModel.findOne({
                lots: match._id,
            });
            if (fulfillment) {
                if (!match.company) match.company = fulfillment.company;
                if (!match.location) match.location = fulfillment.location;
                await match.save();
                count += 1;
                console.log(`${count}/${matches.length}`);
            }
        }
        return true;
    }

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
        else return doc.toJSON();
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
        return res.map((doc) => doc.toJSON());
    }
}

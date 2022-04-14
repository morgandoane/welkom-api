import { LotModel } from './../Lot/Lot';
import { Company, CompanyLoader } from './../Company/Company';
import { Context } from './../../auth/context';
import { CreateExpenseInput, UpdateExpenseInput } from './ExpenseInput';
import { loaderResult } from './../../utils/loaderResult';
import { ObjectId } from 'mongoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Paginate } from './../Paginate';
import { ExpenseFilter } from './ExpenseFilter';
import { ExpenseList } from './ExpenseList';
import { Permitted } from '@src/auth/middleware/Permitted';
import { createBaseResolver } from './../Base/BaseResolvers';
import {
    Arg,
    Ctx,
    Query,
    Resolver,
    UseMiddleware,
    Mutation,
    FieldResolver,
    Root,
} from 'type-graphql';
import { Expense, ExpenseKey, ExpenseLoader, ExpenseModel } from './Expense';
import { Permission } from '@src/auth/permissions';

const BaseResolvers = createBaseResolver();

@Resolver(() => Expense)
export class ExpenseResolvers extends BaseResolvers {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetExpenses })
    )
    @Query(() => ExpenseList)
    async expenses(
        @Arg('filter', () => ExpenseFilter) filter: ExpenseFilter
    ): Promise<ExpenseList> {
        return await Paginate.paginate({
            model: ExpenseModel,
            query: filter.serializeExpenseFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetExpenses })
    )
    @Query(() => Expense)
    async expense(
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<Expense> {
        return loaderResult(await ExpenseLoader.load(id.toString()));
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateExpenses })
    )
    @Mutation(() => Expense)
    async createExpense(
        @Ctx() context: Context,
        @Arg('data', () => CreateExpenseInput) data: CreateExpenseInput
    ): Promise<Expense> {
        const res = await ExpenseModel.create(await data.validate(context));

        return res.toJSON() as unknown as Expense;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateExpenses })
    )
    @Mutation(() => Expense)
    async updateExpense(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data', () => UpdateExpenseInput) data: UpdateExpenseInput
    ): Promise<Expense> {
        const res = await ExpenseModel.findOneAndUpdate(
            { _id: id.toString() },
            await data.serializeExpenseUpdate(context)
        );

        if (data.deleted) {
            switch (res.key) {
                case ExpenseKey.Lot: {
                    const otherExpenses = await ExpenseModel.find({
                        against: res.against,
                        deleted: false,
                    });
                    if (otherExpenses.length == 0)
                        await LotModel.findOneAndUpdate(
                            { _id: res.against.toString() },
                            { expensed: false }
                        );
                    break;
                }
            }
        }

        ExpenseLoader.clear(id.toString());

        return res.toJSON() as unknown as Expense;
    }

    @FieldResolver(() => Company)
    async customer(@Root() { customer }: Expense): Promise<Company> {
        return loaderResult(await CompanyLoader.load(customer.toString()));
    }

    @FieldResolver(() => Company)
    async vendor(@Root() { vendor }: Expense): Promise<Company> {
        return loaderResult(await CompanyLoader.load(vendor.toString()));
    }
}

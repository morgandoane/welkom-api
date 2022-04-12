import { Paginate } from '../Pagination/Pagination';
import { ExpenseFilter } from './ExpenseFilter';
import { ExpenseList } from './ExpenseList';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { CreateExpenseInput } from './CreateExpenseInput';
import { CompanyLoader } from '../Company/Company';
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
import { Expense, ExpenseModel, ExpenseLoader } from './Expense';
import { Company } from '../Company/Company';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { UpdateExpenseInput } from './UpdateExpenseInput';
import { ExpenseModifier } from './ExpenseModifider';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Expense)
export class ExpenseResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetExpenses })
    )
    @Query(() => ExpenseList)
    async expenses(@Arg('filter') filter: ExpenseFilter): Promise<ExpenseList> {
        return await Paginate.paginate({
            model: ExpenseModel,
            query: await filter.serializeExpenseFilter(),
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
        @Arg('id', () => ObjectIdScalar) id: Ref<Expense>
    ): Promise<Expense> {
        return await ExpenseLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateExpenses })
    )
    @Mutation(() => Expense)
    async createExpense(
        @Ctx() context: Context,
        @Arg('data', () => CreateExpenseInput) data: CreateExpenseInput
    ): Promise<Expense> {
        const doc = await data.validateExpense(context);
        const res = await ExpenseModel.create(doc);

        await ExpenseModifier[doc.expense_class](res.against);

        return res;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateExpenses })
    )
    @Mutation(() => Expense)
    async updateExpense(
        @Arg('id', () => ObjectIdScalar) id: Ref<Expense>,
        @Arg('data', () => UpdateExpenseInput) data: UpdateExpenseInput
    ): Promise<Expense> {
        const res = await ExpenseModel.findByIdAndUpdate(
            id,
            await data.serializeExpenseUpdate(),
            { new: true }
        );

        await ExpenseModifier[res.expense_class](res.against);

        return res;
    }

    @FieldResolver(() => Company)
    async customer(@Root() expense: Expense): Promise<Company> {
        return await CompanyLoader.load(expense.customer, true);
    }

    @FieldResolver(() => Company)
    async vendor(@Root() expense: Expense): Promise<Company> {
        return await CompanyLoader.load(expense.vendor, true);
    }
}

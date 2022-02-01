import { createUploadEnabledResolver } from './../UploadEnabled/UploadEnabledResolvers';
import { Expense, ExpenseLoader } from './../Expense/Expense';
import { Expensed } from './Expensed';
import { Profile } from './../Profile/Profile';
import { FieldResolver, Resolver, Root } from 'type-graphql';

export const createExpensedResolver = () => {
    const UploadEnabledResolver = createUploadEnabledResolver();

    @Resolver(() => Expensed, { isAbstract: true })
    abstract class ExpensedResolver extends UploadEnabledResolver {
        @FieldResolver(() => Profile)
        async expenses(@Root() base: Expensed): Promise<Expense[]> {
            return await ExpenseLoader.loadMany(
                base.expenses.map((id) => id.toString()),
                true
            );
        }
    }

    return ExpensedResolver;
};

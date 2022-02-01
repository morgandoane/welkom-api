import { UploadEnabled } from './UploadEnabled';
import { createBaseResolver } from '../Base/BaseResolvers';
import { Resolver } from 'type-graphql';

export const createUploadEnabledResolver = () => {
    const BaseResolver = createBaseResolver();

    @Resolver(() => UploadEnabled, { isAbstract: true })
    abstract class UploadEnabledResolver extends BaseResolver {
        // @FieldResolver(() => Profile)
        // async expenses(@Root() base: Expensed): Promise<Expense[]> {
        //     return await ExpenseLoader.loadMany(
        //         base.expenses.map((id) => id.toString()),
        //         true
        //     );
        // }
    }

    return UploadEnabledResolver;
};

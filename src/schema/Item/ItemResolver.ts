import { Resolver } from 'type-graphql';
import { UploadEnabled } from '../UploadEnabled/UploadEnabled';
import { createUploadEnabledResolver } from '../UploadEnabled/UploadEnabledResolvers';

export const createItemResolver = () => {
    const UploadEnabledResolver = createUploadEnabledResolver();

    @Resolver(() => UploadEnabled, { isAbstract: true })
    abstract class ItemResolver extends UploadEnabledResolver {
        // @FieldResolver(() => Profile)
        // async expenses(@Root() base: Item): Promise<Expense[]> {
        //     return await ExpenseLoader.loadMany(
        //         base.expenses.map((id) => id.toString()),
        //         true
        //     );
        // }
    }

    return ItemResolver;
};

import { CompanyLoader } from './../Company/Company';
import { ExpenseSummary } from './ExpenseSummary';
import { FieldResolver, Resolver, Root } from 'type-graphql';
import { Company } from '../Company/Company';

@Resolver(() => ExpenseSummary)
export class ExpenseSummaryResolvers {
    @FieldResolver(() => Company)
    async customer(@Root() { customer }: ExpenseSummary): Promise<Company> {
        return await CompanyLoader.load(customer, true);
    }
}

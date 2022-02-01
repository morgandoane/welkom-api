import { Itinerary } from './../Itinerary/Itinerary';
import { Lot } from './../Lot/Lot';
import { UploadEnabledFilter } from './../UploadEnabled/UploadEnabledFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType, Ref } from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Expense } from './Expense';
import { ExpenseClass } from './ExpenseClass';

@InputType()
export class ExpenseFilter extends UploadEnabledFilter {
    @Field(() => ObjectIdScalar, { nullable: true })
    customer?: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    vendor?: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    against?: Ref<Lot | Itinerary>;

    @Field(() => ExpenseClass, { nullable: true })
    expense_class?: ExpenseClass;

    public async serializeExpenseFilter(): Promise<
        FilterQuery<DocumentType<Expense>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Expense>>;

        if (this.vendor) query.vendor = this.vendor;
        if (this.customer) query.customer = this.customer;
        if (this.against) query.against = this.against;
        if (this.expense_class) query.expense_class = this.expense_class;

        return query;
    }
}

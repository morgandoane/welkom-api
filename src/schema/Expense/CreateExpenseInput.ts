import { LotLoader } from './../Lot/Lot';
import { ItineraryLoader } from './../Itinerary/Itinerary';
import { CompanyLoader } from './../Company/Company';
import { Context } from './../../auth/context';
import { Ref, mongoose } from '@typegoose/typegoose';
import { Min } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Company } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { ExpenseClass } from './ExpenseClass';
import { Expense } from './Expense';

@InputType()
export class CreateExpenseInput {
    @Min(0)
    @Field()
    amount!: number;

    @Field(() => ObjectIdScalar)
    customer!: Ref<Company>;

    @Field(() => ObjectIdScalar)
    vendor!: Ref<Company>;

    @Field(() => ExpenseClass)
    expense_class!: ExpenseClass;

    @Field(() => ObjectIdScalar)
    against!: mongoose.Types.ObjectId;

    public async validateExpense(context: Context): Promise<Expense> {
        const vendor = await CompanyLoader.load(this.vendor, true);
        const customer = await CompanyLoader.load(this.customer, true);
        if (this.expense_class == ExpenseClass.Itinerary) {
            const itinerary = await ItineraryLoader.load(this.against, true);
        } else {
            const lot = await LotLoader.load(this.against, true);
        }
        const expense: Expense = {
            ...context.base,
            ...this,
        };

        return expense;
    }
}

import { ObjectIdScalar } from './../ObjectIdScalar';
import { FilterQuery } from 'mongoose';
import { RangeInput } from './../Range/RangeInput';
import { Expense, ExpenseKey } from './Expense';
import { BaseFilter } from './../Base/BaseFilter';
import { Field, InputType } from 'type-graphql';

@InputType()
export class ExpenseFilter extends BaseFilter {
    @Field(() => ExpenseKey, { nullable: true })
    key?: ExpenseKey;

    @Field(() => RangeInput, { nullable: true })
    amount?: RangeInput;

    @Field(() => ObjectIdScalar, { nullable: true })
    against?: string;

    public serializeExpenseFilter(): FilterQuery<Expense> {
        const res: FilterQuery<Expense> = { ...this.serializeBaseFilter() };

        if (this.key) res.key = this.key;
        if (this.amount)
            res.amount = { $gte: this.amount.min, $lte: this.amount.max };
        if (this.against) res.against = this.against;

        return res;
    }
}

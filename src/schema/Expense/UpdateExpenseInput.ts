import { Ref } from '@typegoose/typegoose';
import { Min } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Company, CompanyLoader } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Expense } from './Expense';

@InputType()
export class UpdateExpenseInput {
    @Field({ nullable: true })
    deleted?: boolean;

    @Min(0)
    @Field({ nullable: true })
    amount?: number;

    @Field(() => ObjectIdScalar, { nullable: true })
    customer?: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    vendor?: Ref<Company>;

    public async serializeExpenseUpdate(): Promise<Partial<Expense>> {
        const res: Partial<Expense> = {};

        if (this.deleted !== null && this.deleted !== undefined) {
            res.deleted = this.deleted;
        }
        if (this.amount) res.amount = this.amount;
        if (this.customer) {
            const customer = await CompanyLoader.load(this.customer, true);
            res.customer = customer._id;
        }
        if (this.vendor) {
            const vendor = await CompanyLoader.load(this.vendor, true);
            res.vendor = vendor._id;
        }

        return res;
    }
}

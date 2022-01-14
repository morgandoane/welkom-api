import { mongoose } from '@typegoose/typegoose';
import { CompanyLoader } from './../Company/Company';
import { loaderResult } from './../../utils/loaderResult';
import { Context } from './../../auth/context';
import { ObjectId } from 'mongoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Field, InputType } from 'type-graphql';
import { Expense, ExpenseKey } from './Expense';

@InputType()
export class CreateExpenseInput {
    @Field()
    amount!: number;

    @Field(() => ExpenseKey)
    key!: ExpenseKey;

    @Field(() => ObjectIdScalar)
    against!: ObjectId;

    @Field(() => ObjectIdScalar)
    customer!: ObjectId;

    @Field(() => ObjectIdScalar)
    vendor!: ObjectId;

    @Field({ nullable: true })
    note?: string;

    @Field({ nullable: true })
    invoice?: string;

    public async validate({ base }: Context): Promise<Expense> {
        const customer = loaderResult(
            await CompanyLoader.load(this.customer.toString())
        );
        const vendor = loaderResult(
            await CompanyLoader.load(this.vendor.toString())
        );
        return {
            ...base,
            customer: customer._id,
            vendor: vendor._id,
            amount: this.amount,
            against: new mongoose.Types.ObjectId(this.against.toString()),
            note: this.note,
            invoice: this.invoice,
            key: this.key,
        };
    }
}

@InputType()
export class UpdateExpenseInput {
    @Field({ nullable: true })
    deleted?: boolean;

    @Field({ nullable: true })
    amount?: number;

    @Field(() => ObjectIdScalar, { nullable: true })
    customer?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    vendor?: ObjectId;

    @Field({ nullable: true })
    note?: string;

    @Field({ nullable: true })
    invoice?: string;

    public async serializeExpenseUpdate({
        base,
    }: Context): Promise<Partial<Expense>> {
        const res: Partial<Expense> = {
            date_modified: base.date_modified,
            modified_by: base.modified_by,
        };

        if (this.deleted !== null && this.deleted !== undefined) {
            res.deleted = this.deleted;
        }

        if (this.amount !== undefined && this.amount !== null)
            res.amount = this.amount;

        if (this.customer) {
            const customer = loaderResult(
                await CompanyLoader.load(this.customer.toString())
            );

            res.customer = customer._id;
        }

        if (this.vendor) {
            const vendor = loaderResult(
                await CompanyLoader.load(this.vendor.toString())
            );

            res.vendor = vendor._id;
        }

        if (this.note !== undefined) {
            res.note = this.note;
        }

        if (this.invoice !== undefined) {
            res.invoice = this.invoice;
        }

        return res;
    }
}

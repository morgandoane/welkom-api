import { Field, ObjectType } from 'type-graphql';
import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { Configured } from '../Configured/Configured';

@ObjectType()
export class Expense extends Configured {
    @Field()
    @prop({ required: true })
    amount!: number;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    customer!: Ref<Company>;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    vendor!: Ref<Company>;

    @Field({ nullable: true })
    @prop({ required: false })
    note?: string;
}

export const ExpenseModel = getModelForClass(Expense);

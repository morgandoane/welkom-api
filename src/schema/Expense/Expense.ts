import { getBaseLoader } from './../../utils/baseLoader';
import { ExpenseClass } from './ExpenseClass';
import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import {
    modelOptions,
    getModelForClass,
    prop,
    Ref,
    mongoose,
} from '@typegoose/typegoose';
import { Min } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { Company } from '../Company/Company';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'expenses',
    },
})
export class Expense extends UploadEnabled {
    @Min(0)
    @Field()
    @prop({ required: true, min: 0 })
    amount!: number;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    customer!: Ref<Company>;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    vendor!: Ref<Company>;

    @Field(() => ExpenseClass)
    @prop({ required: true, enum: ExpenseClass })
    expense_class!: ExpenseClass;

    @Field(() => String)
    @prop({ required: true, type: mongoose.Types.ObjectId })
    against!: mongoose.Types.ObjectId;
}

export const ExpenseModel = getModelForClass(Expense);
export const ExpenseLoader = getBaseLoader(ExpenseModel);

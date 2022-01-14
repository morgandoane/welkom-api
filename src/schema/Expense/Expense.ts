import { getBaseLoader } from './../Loader';
import { Base } from './../Base/Base';
import { Field, ObjectType } from 'type-graphql';
import {
    getModelForClass,
    prop,
    Ref,
    mongoose,
    modelOptions,
} from '@typegoose/typegoose';
import { Company } from '../Company/Company';

export enum ExpenseKey {
    Bol = 'Bol',
    Itinerary = 'Itinerary',
    Lot = 'Lot',
    Order = 'Order',
}

@modelOptions({
    schemaOptions: {
        collection: 'expenses',
    },
})
@ObjectType()
export class Expense extends Base {
    @Field()
    @prop({ required: true })
    amount!: number;

    @Field(() => ExpenseKey)
    @prop({ required: true, enum: ExpenseKey })
    key!: ExpenseKey;

    @prop({ required: true })
    @Field(() => String)
    against!: mongoose.Types.ObjectId;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    customer!: Ref<Company>;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    vendor!: Ref<Company>;

    @Field({ nullable: true })
    @prop({ required: false })
    note?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    invoice?: string;
}

export const ExpenseModel = getModelForClass(Expense);

export const ExpenseLoader = getBaseLoader(ExpenseModel);

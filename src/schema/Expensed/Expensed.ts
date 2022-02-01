import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import { Expense } from './../Expense/Expense';
import { prop, Ref } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Expensed extends UploadEnabled {
    @Field(() => [Expense])
    @prop({ required: true, ref: () => Expense })
    expenses!: Ref<Expense>[];
}

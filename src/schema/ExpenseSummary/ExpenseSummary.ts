import { prop, Ref } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Company } from '../Company/Company';

@ObjectType()
export class ExpenseSummary {
    @Field({ nullable: true })
    @prop({ required: false })
    total_amount!: number | null;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    customer!: Ref<Company>;

    @Field({ nullable: true })
    @prop({ required: false })
    holdup!: string | null;
}

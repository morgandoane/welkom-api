import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Batch } from '../Batch/Batch';
import { ObjectIdScalar } from '../ObjectIdScalar';

@InputType()
export class BatchLineInput {
    @Field(() => ObjectIdScalar)
    batch!: Ref<Batch>;

    @Field()
    code_or_id!: string;

    @Field(() => [ObjectIdScalar])
    active_steps!: Ref<Batch>[];

    @Field({ nullable: true })
    crumb?: boolean;
}

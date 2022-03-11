import { OrderQueueLine } from './../OrderQueueLine/OrderQueueLine';
import { Base } from '@src/schema/Base/Base';
import { modelOptions, prop, getModelForClass } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'orderQueues',
    },
})
export class OrderQueue extends Base {
    @Field(() => [OrderQueueLine])
    @prop({ required: true, type: () => OrderQueueLine })
    lines!: OrderQueueLine[];
}

export const OrderQueueModel = getModelForClass(OrderQueue);

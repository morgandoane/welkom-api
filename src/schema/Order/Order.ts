import { Itinerary } from './../Itinerary/Itinerary';
import { OrderContent } from './../Content/Content';
import { Base } from './../Base/Base';
import { getBaseLoader } from './../Loader';
import { Field, ObjectType } from 'type-graphql';
import {
    getModelForClass,
    modelOptions,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Company } from '../Company/Company';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'orders',
    },
})
export class Order extends Base {
    @Field()
    @prop({ required: true })
    code!: string;

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    customer?: Ref<Company>;

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    vendor?: Ref<Company>;

    @Field(() => [OrderContent])
    @prop({ required: true, type: () => OrderContent })
    contents!: OrderContent[];

    @Field(() => [Itinerary])
    itineraries?: Itinerary[];

    @Field({ nullable: true })
    @prop({ required: false })
    due?: Date;
}

export const OrderModel = getModelForClass(Order);

export const OrderLoader = getBaseLoader(OrderModel);

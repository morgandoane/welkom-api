import { Base } from './../Base/Base';
import { getBaseLoader } from './../Loader';
import { Field, ObjectType } from 'type-graphql';
import { ItemContent } from '../Content/Content';
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
    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    customer?: Ref<Company>;

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    vendor?: Ref<Company>;

    @Field(() => [ItemContent])
    @prop({ required: true, type: () => ItemContent })
    contents!: ItemContent[];

    @Field({ nullable: true })
    @prop({ required: false })
    due?: Date;
}

export const OrderModel = getModelForClass(Order);

export const OrderLoader = getBaseLoader(OrderModel);

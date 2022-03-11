import { Approval } from './../Approval/Approval';
import { OrderAppointment } from './../OrderAppointment/OrderAppointment';
import { getBaseLoader } from '@src/utils/baseLoader';
import {
    getModelForClass,
    modelOptions,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import { Field, ObjectType } from 'type-graphql';
import { Company } from '../Company/Company';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'orders',
    },
})
export class Order extends UploadEnabled {
    @Field()
    @prop({ required: true })
    po!: string;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    customer!: Ref<Company>;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    vendor!: Ref<Company>;

    @Field(() => [OrderAppointment])
    @prop({ required: true, type: () => OrderAppointment })
    appointments!: OrderAppointment[];

    @Field(() => Approval, { nullable: true })
    @prop({ required: false })
    approval?: Approval;
}

export const OrderModel = getModelForClass(Order);
export const OrderLoader = getBaseLoader(OrderModel);

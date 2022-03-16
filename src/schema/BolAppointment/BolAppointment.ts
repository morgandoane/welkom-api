import { prop, Ref } from '@typegoose/typegoose';
import { Appointment } from './../Appointment/Appointment';
import { Field, ObjectType } from 'type-graphql';
import { OrderAppointment } from '../OrderAppointment/OrderAppointment';

@ObjectType()
export class BolAppointment extends Appointment {
    @Field(() => OrderAppointment, { nullable: true })
    @prop({ required: false, ref: () => OrderAppointment })
    order_appointment!: Ref<OrderAppointment> | null;
}

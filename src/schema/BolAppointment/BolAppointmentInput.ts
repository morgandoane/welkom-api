import { UserInputError } from 'apollo-server-core';
import { OrderModel } from './../Order/Order';
import { BolAppointment } from './BolAppointment';
import { ObjectIdScalar } from './../ObjectIdScalar/ObjectIdScalar';
import { AppointmentInput } from './../Appointment/AppointmentInput';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { OrderAppointment } from '../OrderAppointment/OrderAppointment';

@InputType()
export class BolAppointmentInput extends AppointmentInput {
    @Field(() => ObjectIdScalar, { nullable: true })
    order_appointment!: Ref<OrderAppointment> | null;

    public async validateBolAppointment(): Promise<BolAppointment> {
        const apt: BolAppointment = {
            ...(await this.validateAppointment()),
            order_appointment: null,
        };

        if (this.order_appointment) {
            const order = await OrderModel.findOne({
                ['appointments._id']: this.order_appointment,
            });

            if (order) apt.order_appointment = this.order_appointment;
            else
                throw new UserInputError(
                    'Failed to find order for appointment with id ' +
                        this.order_appointment.toString()
                );
        }

        return apt;
    }
}

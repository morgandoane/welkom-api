import { OrderAppointment } from './../OrderAppointment/OrderAppointment';
import { BolAppointment } from './BolAppointment';
import { FieldResolver, Resolver, Root } from 'type-graphql';
import { OrderModel } from '../Order/Order';

@Resolver(() => BolAppointment)
export class BolAppointmentResolvers {
    @FieldResolver(() => BolAppointment)
    async order_appointment(
        @Root() { order_appointment }: BolAppointment
    ): Promise<OrderAppointment | null> {
        if (!order_appointment) return null;

        const order = await OrderModel.findOne({
            ['appointments._id']: order_appointment,
        });

        if (!order) return null;

        const index = order.appointments
            .map((ap) => ap._id.toString())
            .indexOf(order_appointment.toString());

        return order.appointments[index];
    }
}

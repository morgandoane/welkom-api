import { ObjectIdScalar } from '@src/schema/ObjectIdScalar/ObjectIdScalar';
import { OrderAppointmentInput } from './../OrderAppointment/OrderAppointmentInput';
import { CompanyLoader } from './../Company/Company';
import { Context } from '@src/auth/context';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Order } from './Order';
import { Company } from '../Company/Company';

@InputType()
export class CreateOrderInput {
    @Field()
    po!: string;

    @Field(() => ObjectIdScalar)
    customer!: Ref<Company>;

    @Field(() => ObjectIdScalar)
    vendor!: Ref<Company>;

    @Field(() => [OrderAppointmentInput])
    appointments!: OrderAppointmentInput[];

    public async validateOrder(context: Context): Promise<Order> {
        const customer = await CompanyLoader.load(this.customer, true);
        const vendor = await CompanyLoader.load(this.vendor, true);

        const order: Order = {
            ...context.base,
            customer: customer._id,
            vendor: vendor._id,
            appointments: [],
            po: this.po,
        };

        for (const appointment of this.appointments) {
            order.appointments.push(
                await appointment.validateOrderAppointmentInput(context)
            );
        }

        return order;
    }
}

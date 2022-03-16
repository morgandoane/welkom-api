import { ObjectIdScalar } from '@src/schema/ObjectIdScalar/ObjectIdScalar';
import { OrderAppointmentInput } from '../OrderAppointment/OrderAppointmentInput';
import { CompanyLoader } from '../Company/Company';
import { Context } from '@src/auth/context';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Order } from './Order';
import { Company } from '../Company/Company';

@InputType()
export class UpdateOrderInput {
    @Field({ nullable: true })
    po?: string;

    @Field({ nullable: true })
    deleted?: boolean;

    @Field(() => ObjectIdScalar, { nullable: true })
    customer?: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    vendor?: Ref<Company>;

    @Field(() => [OrderAppointmentInput], { nullable: true })
    appointments?: OrderAppointmentInput[];

    public async serializeOrderUpdate(
        context: Context
    ): Promise<Partial<Order>> {
        const order: Partial<Order> = {};

        if (this.deleted !== undefined) order.deleted = this.deleted;
        if (this.po !== undefined) order.po = this.po;
        if (this.appointments)
            order.appointments = await Promise.all(
                this.appointments.map((apt) =>
                    apt.validateOrderAppointmentInput(context)
                )
            );
        if (this.customer) {
            const customer = await CompanyLoader.load(this.customer, true);
            order.customer = customer._id;
        }
        if (this.vendor) {
            const vendor = await CompanyLoader.load(this.vendor, true);
            order.vendor = vendor._id;
        }

        return order;
    }
}

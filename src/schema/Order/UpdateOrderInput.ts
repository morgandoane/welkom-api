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
    @Field()
    po?: string;

    @Field(() => ObjectIdScalar)
    customer?: Ref<Company>;

    @Field(() => ObjectIdScalar)
    vendor?: Ref<Company>;

    public async serializeOrderUpdate(): Promise<Partial<Order>> {
        const order: Partial<Order> = {};

        if (this.po !== undefined) order.po = this.po;
        if (this.customer) {
            const customer = await CompanyLoader.load(this.customer, true);
            order.customer = customer._id;
        }
        if (this.vendor) {
            const vendor = await CompanyLoader.load(this.vendor, true);
            order.customer = vendor._id;
        }

        return order;
    }
}

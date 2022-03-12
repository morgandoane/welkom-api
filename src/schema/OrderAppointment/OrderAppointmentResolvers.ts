import { LocationLoader } from './../Location/Location';
import { Context } from '@src/auth/context';
import { OrderAppointmentInput } from './OrderAppointmentInput';
import { UserInputError } from 'apollo-server-core';
import { OrderModel } from './../Order/Order';
import { Ref } from '@typegoose/typegoose';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar/ObjectIdScalar';
import { createUploadEnabledResolver } from './../UploadEnabled/UploadEnabledResolvers';
import { OrderAppointment } from './OrderAppointment';
import {
    Resolver,
    UseMiddleware,
    Mutation,
    Arg,
    Ctx,
    FieldResolver,
    Root,
} from 'type-graphql';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { Location } from '../Location/Location';

const UploadEnabledResolvers = createUploadEnabledResolver();

@Resolver(() => OrderAppointment)
export class OrderAppointmentResolvers extends UploadEnabledResolvers {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateOrder })
    )
    @Mutation(() => OrderAppointment)
    async updateOrderAppointment(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: Ref<OrderAppointment>,
        @Arg('data', () => OrderAppointmentInput) data: OrderAppointmentInput
    ): Promise<OrderAppointment> {
        const order = await OrderModel.findOne({ ['appointments._id']: id });

        if (!order) throw new UserInputError('Failed to find order.');

        const index = order.appointments
            .map((app) => app._id.toString())
            .indexOf(id.toString());

        const {
            contents,
            date,
            location,
            deleted = false,
        } = await data.validateOrderAppointmentInput(context);

        order.appointments[index].contents = contents;
        order.appointments[index].date = date;
        order.appointments[index].location = location;
        order.appointments[index].deleted = deleted;

        const res = await OrderModel.findByIdAndUpdate(
            order._id,
            {
                appointments: order.appointments,
            },
            { new: true }
        );

        return order.appointments[index];
    }

    @FieldResolver(() => Location)
    async location(@Root() { location }: OrderAppointment): Promise<Location> {
        return await LocationLoader.load(location, true);
    }
}

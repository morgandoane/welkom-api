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
    @FieldResolver(() => Location)
    async location(@Root() { location }: OrderAppointment): Promise<Location> {
        return await LocationLoader.load(location, true);
    }
}

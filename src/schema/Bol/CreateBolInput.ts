import { UserInputError } from 'apollo-server-core';
import { ItineraryLoader } from './../Itinerary/Itinerary';
import { Context } from '@src/auth/context';
import { AppointmentInput } from './../Appointment/AppointmentInput';
import { BolContentInput } from './../BolContent/BolContentInput';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Itinerary } from '../Itinerary/Itinerary';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Bol } from './Bol';
import { OrderAppointment } from '../OrderAppointment/OrderAppointment';
import { OrderModel } from '../Order/Order';

@InputType()
export class CreateBolInput {
    @Field(() => ObjectIdScalar)
    itinerary!: Ref<Itinerary>;

    @Field({ nullable: true })
    code!: string | null;

    @Field(() => [BolContentInput])
    contents!: BolContentInput[];

    @Field(() => AppointmentInput)
    from!: AppointmentInput;

    @Field(() => ObjectIdScalar)
    to!: Ref<OrderAppointment>;

    public async validateBol(context: Context): Promise<Bol> {
        const { _id: itinerary } = await ItineraryLoader.load(
            this.itinerary,
            true
        );

        const parentOrder = await OrderModel.findOne({
            ['appointments._id']: this.to,
        });

        if (!parentOrder)
            throw new UserInputError(
                'Failed to find order appointment with id ' + this.to.toString()
            );

        const bol: Bol = {
            ...context.base,
            itinerary,
            code: this.code,
            contents: [],
            from: await this.from.validateAppointment(),
            to: this.to,
        };

        for (const content of this.contents) {
            bol.contents.push(await content.validateBolContentInput());
        }

        return bol;
    }
}

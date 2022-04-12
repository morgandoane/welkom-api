import { BolAppointmentInput } from './../BolAppointment/BolAppointmentInput';
import { ItineraryLoader } from './../Itinerary/Itinerary';
import { Context } from '@src/auth/context';
import { AppointmentInput } from './../Appointment/AppointmentInput';
import { BolContentInput } from './../BolContent/BolContentInput';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Itinerary } from '../Itinerary/Itinerary';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Bol } from './Bol';
import { Order } from '../Order/Order';
import { BolStatus } from './BolStatus';

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

    @Field(() => BolAppointmentInput)
    to!: BolAppointmentInput;

    public async validateBol(context: Context): Promise<Bol> {
        const { _id: itinerary } = await ItineraryLoader.load(
            this.itinerary,
            true
        );

        const bol: Bol = {
            ...context.base,
            itinerary,
            code: this.code,
            contents: [],
            from: await this.from.validateAppointment(),
            to: await this.to.validateBolAppointment(),
            status: BolStatus.Pending,
        };

        for (const content of this.contents) {
            bol.contents.push(await content.validateBolContentInput());
        }

        return bol;
    }
}

import { ItineraryLoader } from './../Itinerary/Itinerary';
import { Context } from '@src/auth/context';
import { AppointmentInput } from './../Appointment/AppointmentInput';
import { BolContentInput } from './../BolContent/BolContentInput';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Appointment } from '../Appointment/Appointment';
import { Itinerary } from '../Itinerary/Itinerary';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Bol } from './Bol';

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

    @Field(() => AppointmentInput)
    to!: AppointmentInput;

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
            to: await this.to.validateAppointment(),
        };

        for (const content of this.contents) {
            bol.contents.push(await content.validateBolContentInput());
        }

        return bol;
    }
}

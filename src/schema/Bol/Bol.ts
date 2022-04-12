import { projectBolStatus } from './projectBolStatus';
import { BolStatus } from '@src/schema/Bol/BolStatus';
import { BolAppointment } from './../BolAppointment/BolAppointment';
import { Appointment } from '../Appointment/Appointment';
import { BolContent } from './../BolContent/BolContent';
import { modelOptions, post, pre, prop, Ref } from '@typegoose/typegoose';
import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import { Field, ObjectType } from 'type-graphql';
import { Itinerary } from '../Itinerary/Itinerary';
import { setBolStatus } from './setBolStatus';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'bols',
    },
})
@pre<Bol>('save', async function () {
    const status = await setBolStatus(this);
    this.status = status;
})
@post<Bol>('save', async function (bol) {
    await projectBolStatus(bol.itinerary.toString());
})
export class Bol extends UploadEnabled {
    @Field(() => Itinerary, { nullable: true })
    @prop({ required: false, ref: () => Itinerary })
    itinerary!: Ref<Itinerary> | null;

    @Field({ nullable: true })
    @prop({ required: false })
    code!: string | null;

    @Field(() => [BolContent])
    @prop({ required: true, type: () => BolContent })
    contents!: BolContent[];

    @Field(() => Appointment)
    @prop({ required: true })
    from!: Appointment;

    @Field(() => BolAppointment)
    @prop({ required: true })
    to!: BolAppointment;

    @Field(() => BolStatus)
    @prop({ required: true })
    status: BolStatus;
}

import { Appointment } from '../Appointment/Appointment';
import { BolContent } from './../BolContent/BolContent';
import {
    getModelForClass,
    modelOptions,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import { Field, ObjectType } from 'type-graphql';
import { getBaseLoader } from '@src/utils/baseLoader';
import { Itinerary } from '../Itinerary/Itinerary';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'bols',
    },
})
export class Bol extends UploadEnabled {
    @Field(() => Itinerary)
    @prop({ required: true, ref: () => Itinerary })
    itinerary!: Ref<Itinerary>;

    @Field({ nullable: true })
    @prop({ required: false })
    code!: string | null;

    @Field(() => [BolContent])
    @prop({ required: true, type: () => BolContent })
    contents!: BolContent[];

    @Field(() => Appointment)
    @prop({ required: true })
    from!: Appointment;

    @Field(() => Appointment)
    @prop({ required: true })
    to!: Appointment;
}

export const BolModel = getModelForClass(Bol);
export const BolLoader = getBaseLoader(BolModel);

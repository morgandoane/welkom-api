import { FulfillmentContent } from './../FulfillmentContent/FulfillmentContent';
import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import { Field, ObjectType } from 'type-graphql';
import { getBaseLoader } from '@src/utils/baseLoader';
import { Bol } from '../Bol/Bol';

export enum FulfillmentType {
    Receipt = 'Receipt',
    Shipment = 'Shipment',
}

@ObjectType()
export class Fulfillment extends UploadEnabled {
    @Field(() => FulfillmentType)
    @prop({ required: true, enum: FulfillmentType })
    type!: FulfillmentType;

    @Field(() => Bol)
    @prop({ required: true, ref: 'Bol' })
    bol!: Ref<Bol>;

    @Field(() => [FulfillmentContent])
    @prop({ required: true, type: () => FulfillmentContent })
    contents!: FulfillmentContent[];
}

export const FulfillmentModel = getModelForClass(Fulfillment);
export const FulfillmentLoader = getBaseLoader(FulfillmentModel);

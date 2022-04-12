import { BolStatus } from './../Bol/BolStatus';
import { BolModel } from './../Bol/BolModel';
import { FulfillmentContent } from './../FulfillmentContent/FulfillmentContent';
import { getModelForClass, post, prop, Ref } from '@typegoose/typegoose';
import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import { Field, ObjectType } from 'type-graphql';
import { getBaseLoader } from '@src/utils/baseLoader';
import { Bol } from '../Bol/Bol';

export enum FulfillmentType {
    Receipt = 'Receipt',
    Shipment = 'Shipment',
}

@ObjectType()
@post<Fulfillment>('save', async function (fulfillment) {
    const bol = await BolModel.findById(fulfillment.bol);
    const otherFulfillments = await FulfillmentModel.find({
        deleted: false,
        bol: bol._id,
        _id: { $nin: [fulfillment._id] },
    });
    const receipts = [...otherFulfillments, fulfillment].filter(
        (b) => !b.deleted && b.type === FulfillmentType.Receipt
    );
    const shipments = [...otherFulfillments, fulfillment].filter(
        (b) => !b.deleted && b.type === FulfillmentType.Shipment
    );

    const bolStatus: BolStatus =
        receipts.length > 0 && shipments.length > 0
            ? BolStatus.Complete
            : receipts.length > 0
            ? BolStatus.InProgress
            : BolStatus.Pending;

    bol.status = bolStatus;
    await bol.save();
})
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

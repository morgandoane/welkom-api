import { ObjectId } from 'mongoose';
import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import {
    modelOptions,
    prop,
    getModelForClass,
    Ref,
} from '@typegoose/typegoose';
import { LegacyItemReceipt } from './itemreceipt';

const connection = createConnection(env.LEGACY_ATLAS_URL);

@modelOptions({
    schemaOptions: {
        collection: 'qualitycheckresponses',
    },
    existingConnection: connection,
})
export class LegacyQualityCheckResponse {
    @prop({ required: true })
    question: string;

    @prop({ required: true })
    response: string;

    @prop({ required: true })
    passed: boolean;

    @prop({ required: true, enum: ['shipment', 'lot', 'container'] })
    location: string;

    @prop({ required: true })
    qualityCheckDefinition: ObjectId;

    @prop({ required: true, ref: 'LegacyItemReceipt' })
    itemReceipt: Ref<LegacyItemReceipt>;
}

export const LegacyQualityCheckResponseModel = getModelForClass(
    LegacyQualityCheckResponse
);

import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import { modelOptions, prop, getModelForClass } from '@typegoose/typegoose';

const connection = createConnection(env.LEGACY_ATLAS_URL);

@modelOptions({
    schemaOptions: {
        collection: 'addresses',
    },
    existingConnection: connection,
})
export class LegacyAddress {
    @prop({ required: true })
    line1: string;

    @prop({ required: false })
    line2: string;

    @prop({ required: true })
    city: string;

    @prop({ required: true })
    state: string;

    @prop({ required: true })
    postal: number;
}

export const LegacyAddressModel = getModelForClass(LegacyAddress);

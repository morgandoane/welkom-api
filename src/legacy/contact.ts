import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import { modelOptions, prop, getModelForClass } from '@typegoose/typegoose';

const connection = createConnection(env.LEGACY_ATLAS_URL);

@modelOptions({
    schemaOptions: {
        collection: 'contacts',
    },
    existingConnection: connection,
})
export class LegacyContact {
    @prop({ required: true })
    firstName: string;

    @prop({ required: true })
    lastName: string;

    @prop({ required: false })
    title: string;

    @prop({ required: false })
    email: string;

    @prop({ required: false })
    phone: number;
}

export const LegacyContactModel = getModelForClass(LegacyContact);

import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import { modelOptions, prop, getModelForClass } from '@typegoose/typegoose';

const connection = createConnection(env.LEGACY_ATLAS_URL);

@modelOptions({
    schemaOptions: {
        collection: 'accesslevels',
    },
    existingConnection: connection,
})
export class LegacyAccessLevel {
    @prop({ required: true })
    name!: string;

    @prop({
        enum: ['sublevel', 'fulllevel', 'admin'],
        required: true,
    })
    type: string;
}

export const LegacyAccessLevelModel = getModelForClass(LegacyAccessLevel);

import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import { modelOptions, prop, getModelForClass } from '@typegoose/typegoose';

const connection = createConnection(env.LEGACY_ATLAS_URL);

@modelOptions({
    schemaOptions: {
        collection: 'itemtypes',
    },
    existingConnection: connection,
})
export class LegacyItemType {
    @prop({ required: true })
    name!: string;
}

export const LegacyItemTypeModel = getModelForClass(LegacyItemType);

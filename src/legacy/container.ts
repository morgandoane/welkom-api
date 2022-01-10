import { LegacyQualityCheck } from './qualityCheck';
import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import {
    modelOptions,
    prop,
    getModelForClass,
    Ref,
} from '@typegoose/typegoose';

const connection = createConnection(env.LEGACY_ATLAS_URL);

@modelOptions({
    schemaOptions: {
        collection: 'containers',
    },
    existingConnection: connection,
})
export class LegacyContainer {
    @prop({ required: true })
    containerStatus: string;

    @prop({ required: true })
    containerReason?: string;

    @prop({ required: true })
    failedQcs: boolean;

    @prop({ required: true })
    failedGen: boolean;

    @prop({ required: true, ref: () => LegacyQualityCheck })
    containerQualityChecks: Ref<LegacyQualityCheck>[];
}

export const LegacyContainerModel = getModelForClass(LegacyContainer);

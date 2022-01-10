import { LegacyUnit } from './unit';
import { LegacyContainer } from './container';
import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import {
    modelOptions,
    prop,
    getModelForClass,
    Ref,
} from '@typegoose/typegoose';
import { LegacyItemReceipt } from './itemreceipt';
import { LegacyQualityCheckResponse } from './qualtiyCheckResponse';

const connection = createConnection(env.LEGACY_ATLAS_URL);

export class LegacyContainerBreakdown {
    @prop({ required: true })
    holdCount: number; // Total containers rejected from lot

    @prop({ required: true })
    rejectCount: number; // Total containers held in lot
}

@modelOptions({
    schemaOptions: {
        collection: 'itemlots',
    },
    existingConnection: connection,
})
export class LegacyLot {
    @prop({ required: true, ref: 'LegacyItemReceipt' })
    itemReceipt: Ref<LegacyItemReceipt>;

    @prop({ required: true })
    lot: string;

    @prop({ required: true })
    quantity: number;

    @prop({ required: true, ref: 'LegacyUnit' })
    unitContainer: Ref<LegacyUnit>;

    @prop({ required: true, enum: ['accept', 'hold', 'reject'] })
    lotStatus: string;

    @prop({ required: true })
    failedQcs: boolean;

    @prop({ required: true, ref: 'LegacyQualityCheckResponse' })
    lotQualityChecks: Ref<LegacyQualityCheckResponse>[];

    @prop({ required: true })
    failedContainerQcs: boolean;

    @prop({ required: true })
    failedGen: boolean;

    @prop({ required: true })
    failureCount: number;

    @prop({ required: true })
    containerBreakdown: LegacyContainerBreakdown;

    @prop({ required: true })
    containers: LegacyContainer[];

    @prop({ required: true })
    lotReason: string;
}

export const LegacyLotModel = getModelForClass(LegacyLot);

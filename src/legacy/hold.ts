import { ObjectId } from 'mongoose';
import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import {
    modelOptions,
    prop,
    getModelForClass,
    Ref,
} from '@typegoose/typegoose';
import { LegacyNode } from './node';
import { LegacyUnit } from './unit';
import { LegacyUser } from './user';

const connection = createConnection(env.LEGACY_ATLAS_URL);

@modelOptions({
    schemaOptions: {
        collection: 'holds',
    },
    existingConnection: connection,
})
export class LegacyHold {
    @prop({ required: true, ref: () => LegacyNode })
    node: Ref<LegacyNode>;

    @prop({ required: true })
    quantity: number;

    @prop({ required: true, ref: () => LegacyUnit })
    unitContainer: Ref<LegacyUnit>;

    @prop({ required: true })
    reasons: string[];

    @prop({ required: true })
    holdDate: Date;

    @prop({ required: true, ref: () => LegacyUser })
    createdBy: Ref<LegacyUser>;

    @prop({ required: true })
    resolved: boolean;

    @prop({ required: false, ref: () => LegacyUser })
    resolvedBy?: Ref<LegacyUser>;

    @prop({ required: false })
    resolvedDate?: Date;

    @prop({ required: false })
    response?: string;

    @prop({ required: false })
    quantityAccepted?: number;
}

export const LegacyHoldModel = getModelForClass(LegacyHold);

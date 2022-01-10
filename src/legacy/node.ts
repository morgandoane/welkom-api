import { LegacyUser } from './user';
import { LegacyUnit } from './unit';
import { ObjectId } from 'mongoose';
import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import {
    modelOptions,
    prop,
    getModelForClass,
    Ref,
} from '@typegoose/typegoose';
import { LegacyHold } from './hold';

const connection = createConnection(env.LEGACY_ATLAS_URL);

@modelOptions({
    schemaOptions: {
        collection: 'nodes',
    },
    existingConnection: connection,
})
export class LegacyNode {
    @prop({ required: true })
    target: ObjectId;

    @prop({ required: true, enum: ['ItemOrder', 'ItemReceipt', 'ItemLot'] })
    type: string;

    @prop({ required: true, ref: () => LegacyNode })
    children: Ref<LegacyNode>[];

    @prop({ required: true, ref: () => LegacyNode })
    parents: Ref<LegacyNode>[];

    @prop({
        required: true,
        enum: [
            'clear',
            'isolatedpartialhold',
            'isolatedhold',
            'partialhold',
            'hold',
        ],
    })
    status: string;

    @prop({ required: true, enum: ['clear', 'partialhold', 'hold'] })
    inheritedStatus: string;

    @prop({ required: true, ref: () => LegacyHold })
    targetHold: Ref<LegacyHold>;

    @prop({ required: true, ref: () => LegacyHold })
    parentHolds: Ref<LegacyHold>[];
}

export const LegacyNodeModel = getModelForClass(LegacyNode);

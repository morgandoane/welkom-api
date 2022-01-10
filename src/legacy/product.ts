import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import {
    modelOptions,
    prop,
    getModelForClass,
    Ref,
} from '@typegoose/typegoose';
import { LegacyCustomer } from './customer';
import { CreateItemInput } from '@src/schema/Item/ItemInput';
import { UnitClass } from '@src/schema/Unit/Unit';

const connection = createConnection(env.LEGACY_ATLAS_URL);

export class LegacyContent {
    @prop({ required: true })
    quantity: number;
}

@modelOptions({
    schemaOptions: {
        collection: 'products',
    },
    existingConnection: connection,
})
export class LegacyProduct {
    @prop({ required: true })
    name: string;

    @prop({ required: true })
    upc: string;

    @prop({ required: true })
    sku: string;

    @prop({ required: true, type: () => LegacyContent })
    contents: LegacyContent[];

    @prop({ required: true, ref: () => LegacyCustomer })
    customers: Ref<LegacyCustomer>[];

    @prop({ required: true })
    boxesPerCase: number;

    @prop({ required: true })
    casesPerPallet: number;

    @prop({ required: true })
    specs: string[];

    @prop({ required: true })
    active: boolean;

    @prop({ required: true })
    netWeight: number;

    @prop({ required: true })
    tareWeight: number;

    @prop({ required: true })
    boxCodeFormat: string;

    @prop({ required: true })
    caseCodeFormat: string;

    public async convert(): Promise<CreateItemInput> {
        return {
            unit_class: UnitClass.Count,
            english: this.name,
            spanish: this.name,
        };
    }
}

export const LegacyProductModel = getModelForClass(LegacyProduct);

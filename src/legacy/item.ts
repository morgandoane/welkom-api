import { LegacyContact } from './contact';
import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import {
    modelOptions,
    prop,
    getModelForClass,
    Ref,
    mongoose,
} from '@typegoose/typegoose';
import { LegacyQualityCheck } from './qualityCheck';
import { LegacySupplier } from './supplier';
import { LegacyUnit, LegacyUnitModel } from './unit';
import { LegacyItemType } from './itemType';
import { CreateItemInput } from '@src/schema/Item/ItemInput';
import { UnitClass } from '@src/schema/Unit/Unit';
import { getBaseLoader } from '@src/schema/Loader';

const connection = createConnection(env.LEGACY_ATLAS_URL);

@modelOptions({
    schemaOptions: {
        collection: 'items',
    },
    existingConnection: connection,
})
export class LegacyItem {
    @prop({ required: true })
    _id: mongoose.Types.ObjectId;

    @prop({ required: true, unique: true })
    englishName: string;

    @prop({ required: true, unique: true })
    spanishName: string;

    @prop({ required: true })
    initials: string;

    @prop({ required: true, ref: () => LegacySupplier })
    defaultSupplier: Ref<LegacySupplier>;

    @prop({ required: true, ref: () => LegacyUnit })
    defaultUnit: Ref<LegacyUnit>;

    @prop({ required: true })
    conversionFactor: number;

    @prop({ required: true })
    active: boolean;

    @prop({
        required: true,
        enum: [
            'ingredient',
            'packaging',
            'maintenance',
            'sanitation',
            'nontraceable',
            'other',
        ],
        default: 'ingredient',
    })
    tag: string;

    @prop({ required: true, ref: () => LegacyItemType })
    type: Ref<LegacyItemType>;

    @prop({ required: true, type: () => LegacyQualityCheck })
    qualityChecks: LegacyQualityCheck[];

    @prop({ required: true, default: 0 })
    poCount: number;

    @prop({ required: true, type: () => [Number] })
    orderToReceipt: number[];

    @prop({ required: true })
    receivingThreshold: number;

    @prop({ required: true, ref: () => LegacyContact })
    emailTo: Ref<LegacyContact>[];

    @prop({ required: true, ref: () => LegacyContact })
    emailCc: Ref<LegacyContact>[];

    @prop({ required: false })
    number?: string;

    public async convert(): Promise<CreateItemInput> {
        const legacyUnit = await LegacyUnitModel.findById(this.defaultUnit);
        return {
            unit_class:
                legacyUnit.type == 'weight'
                    ? UnitClass.Weight
                    : legacyUnit.type === 'volume'
                    ? UnitClass.Volume
                    : UnitClass.Count,
            english: this.englishName,
            spanish: this.spanishName,
        };
    }
}

export const LegacyItemModel = getModelForClass(LegacyItem);

export const LegacyItemLoader = getBaseLoader(LegacyItemModel);

import { getBaseLoader } from './../schema/Loader';
import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import {
    modelOptions,
    prop,
    getModelForClass,
    mongoose,
} from '@typegoose/typegoose';
import { CreateUnitInput } from '@src/schema/Unit/UnitInputs';
import { UnitClass } from '@src/schema/Unit/Unit';

const connection = createConnection(env.LEGACY_ATLAS_URL);

@modelOptions({
    schemaOptions: {
        collection: 'unitcontainers',
    },
    existingConnection: connection,
})
export class LegacyUnit {
    @prop({ required: true })
    _id: mongoose.Types.ObjectId;

    @prop({ required: true })
    englishName: string;

    @prop({ required: true })
    englishPlural: string;

    @prop({ required: true })
    spanishName: string;

    @prop({ required: true })
    spanishPlural: string;

    @prop({ required: true })
    conversion: number;

    @prop({ required: true, enum: ['weight', 'volume', 'quantity'] })
    type: string;

    public async convert(): Promise<CreateUnitInput> {
        return {
            class:
                this.type == 'weight'
                    ? UnitClass.Weight
                    : this.type == 'volume'
                    ? UnitClass.Volume
                    : UnitClass.Count,
            english: this.englishName,
            spanish: this.spanishName,
            english_plural: this.englishPlural,
            spanish_plural: this.spanishPlural,
            base_per_unit: this.conversion,
        };
    }
}

export const LegacyUnitModel = getModelForClass(LegacyUnit);

export const LegacyUnitLoader = getBaseLoader(LegacyUnitModel);

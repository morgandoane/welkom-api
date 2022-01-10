import { Company } from '@src/schema/Company/Company';
import { LegacyAddress } from './address';
import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import {
    modelOptions,
    prop,
    getModelForClass,
    Ref,
    mongoose,
} from '@typegoose/typegoose';
import { CreateLocationInput } from '@src/schema/Location/LocationInput';
import { getBaseLoader } from '@src/schema/Loader';

const connection = createConnection(env.LEGACY_ATLAS_URL);

export class LegacyLocation {
    @prop({ required: true })
    latitude: number;

    @prop({ required: true })
    longitude: number;
}

@modelOptions({
    schemaOptions: {
        collection: 'plants',
    },
    existingConnection: connection,
})
export class LegacyPlant {
    @prop({ required: true })
    _id: mongoose.Types.ObjectId;

    @prop({ required: true, unique: true })
    name: string;

    @prop({ required: true })
    initials: string;

    @prop({ required: true })
    address: LegacyAddress;

    @prop({ required: true })
    phone: number;

    @prop({ required: true })
    active: boolean;

    @prop({ required: true })
    location: LegacyLocation;

    public async convert(company: Ref<Company>): Promise<CreateLocationInput> {
        return {
            address: {
                line_1: this.address.line1,
                line_2: this.address.line2,
                city: this.address.city,
                state: this.address.state,
                postal: this.address.postal + '',
                country: 'USA',
            },
            company: new mongoose.Types.ObjectId(company.toString()),
            label: this.name,
        };
    }
}

export const LegacyPlantModel = getModelForClass(LegacyPlant);

export const LegacyPlantLoader = getBaseLoader(LegacyPlantModel);

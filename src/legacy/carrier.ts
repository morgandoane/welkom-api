import { LegacyAddress } from './address';
import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import {
    modelOptions,
    prop,
    getModelForClass,
    Ref,
} from '@typegoose/typegoose';
import { LegacyContact } from './contact';
import { CreateCompanyInput } from '@src/schema/Company/CompanyInput';

const connection = createConnection(env.LEGACY_ATLAS_URL);

@modelOptions({
    schemaOptions: {
        collection: 'carriers',
    },
    existingConnection: connection,
})
export class LegacyCarrier {
    @prop({ required: true })
    name: string;

    @prop({ required: true })
    active: boolean;

    @prop({ required: true, ref: () => LegacyContact })
    contacts: Ref<LegacyContact>[];

    @prop({ required: true })
    addresses: LegacyAddress[];

    public async convert(): Promise<CreateCompanyInput> {
        return {
            name: this.name,
        };
    }
}

export const LegacyCarrierModel = getModelForClass(LegacyCarrier);

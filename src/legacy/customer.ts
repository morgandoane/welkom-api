import { LegacyAddress } from './address';
import { LegacyContact } from './contact';
import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import {
    modelOptions,
    prop,
    getModelForClass,
    Ref,
} from '@typegoose/typegoose';
import { CreateCompanyInput } from '@src/schema/Company/CompanyInput';

const connection = createConnection(env.LEGACY_ATLAS_URL);

@modelOptions({
    schemaOptions: {
        collection: 'customers',
    },
    existingConnection: connection,
})
export class LegacyCustomer {
    @prop({ required: true })
    name: string;

    @prop({ required: true })
    active: boolean;

    @prop({ required: true, ref: () => LegacyContact })
    contacts: Ref<LegacyContact>[];

    @prop({ required: true, type: () => LegacyAddress })
    addresses: LegacyAddress[];

    public async convert(): Promise<CreateCompanyInput> {
        return {
            name: this.name,
        };
    }
}

export const LegacyCustomerModel = getModelForClass(LegacyCustomer);

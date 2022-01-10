import { Context } from '@src/auth/context';
import { Contact, ContactModel } from './../schema/Contact/Contact';
import { LegacyAddress } from './address';
import { LegacyContact, LegacyContactModel } from './contact';
import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import {
    modelOptions,
    prop,
    getModelForClass,
    Ref,
    mongoose,
} from '@typegoose/typegoose';
import { CreateCompanyInput } from '@src/schema/Company/CompanyInput';
import { getBaseLoader } from '@src/schema/Loader';

const connection = createConnection(env.LEGACY_ATLAS_URL);

@modelOptions({
    schemaOptions: {
        collection: 'suppliers',
    },
    existingConnection: connection,
})
export class LegacySupplier {
    @prop({ required: true })
    _id: mongoose.Types.ObjectId;

    @prop({ required: true })
    name: string;

    @prop({ required: true })
    active: boolean;

    @prop({ required: true, ref: () => LegacyContact })
    contacts: Ref<LegacyContact>[];

    @prop({ required: true, type: () => LegacyAddress })
    addresses: LegacyAddress[];

    @prop({ required: true, ref: () => LegacyContact })
    emailTo: Ref<LegacyContact>[];

    @prop({ required: true, ref: () => LegacyContact })
    emailCc: Ref<LegacyContact>[];

    public async convert(context: Context): Promise<CreateCompanyInput> {
        const legacyContacts = await LegacyContactModel.find({
            _id: { $in: this.contacts },
        });

        for (const { firstName, lastName, email } of legacyContacts) {
            const match = await ContactModel.findOne({
                given_name: firstName,
                family_name: lastName,
            });

            if (!match) {
                const newContact: Contact = {
                    ...context.base,
                    given_name: firstName,
                    family_name: lastName,
                    email: email,
                    email_on_order: false,
                    cc_on_order: false,
                    phone: firstName,
                };

                await ContactModel.create(newContact);
            }
        }

        return {
            name: this.name,
        };
    }
}

export const LegacySupplierModel = getModelForClass(LegacySupplier);

export const LegacySupplierLoader = getBaseLoader(LegacySupplierModel);

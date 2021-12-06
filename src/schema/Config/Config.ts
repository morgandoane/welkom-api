import { getBaseLoader } from './../Loader';
import { _FieldUnion } from './../Field/_FieldUnion';
import { FieldUnion } from './../Field/FieldUnion';
import {
    DocumentType,
    getModelForClass,
    modelOptions,
    mongoose,
    pre,
    prop,
    Severity,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Base } from '../Base/Base';
import { _FieldValueUnion } from '../Field/Field';
import { UserInputError } from 'apollo-server-errors';
import DataLoader from 'dataloader';

export enum ConfigKey {
    Bol = 'Bol',
    Company = 'Company',
    Item = 'Item',
    Itinerary = 'Itinerary',
    Lot = 'Lot',
    Order = 'Order',
    Procedure = 'Procedure',
    Profile = 'Profile',
    Receipt = 'Receipt',
    Shipment = 'Shipment',
}

@pre<Config>('save', async function () {
    if (this.active == true) {
        await ConfigModel.updateMany({ key: this.key }, { active: false });
    }
})
@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'configs',
    },
    options: {
        allowMixed: Severity.ALLOW,
    },
})
export class Config extends Base {
    @Field(() => ConfigKey)
    @prop({ required: true, enum: ConfigKey })
    key!: ConfigKey;

    @Field()
    @prop({ required: true, default: true })
    active?: boolean;

    @Field(() => [FieldUnion])
    @prop({ required: true })
    fields!: _FieldUnion[];

    public static compare(
        config: Config,
        provided: _FieldValueUnion[]
    ): { success: false; error: Error } | { success: true } {
        const errors: Error[] = [];
        for (const field of config.fields) {
            const match = provided.find(
                (f) => f.key === field.key && f.type == field.type
            );

            if (!match && field.required)
                errors.push(
                    new UserInputError(
                        `Could not find ${field.key} field of type ${field.type}`
                    )
                );
        }

        return errors[0]
            ? { success: false, error: errors[0] }
            : { success: true };
    }
}

export const ConfigModel = getModelForClass(Config);

export const ConfigLoader = getBaseLoader(ConfigModel);

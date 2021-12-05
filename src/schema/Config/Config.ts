import { _FieldUnion } from './../Field/_FieldUnion';
import { FieldUnion } from './../Field/FieldUnion';
import {
    DocumentType,
    getModelForClass,
    modelOptions,
    mongoose,
    prop,
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

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'configs',
    },
})
export class Config extends Base {
    @Field(() => ConfigKey)
    @prop({ required: true, enum: ConfigKey })
    key!: ConfigKey;

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

export const ConfigLoader = new DataLoader<string, DocumentType<Config>>(
    async (keys: readonly string[]) => {
        let res: DocumentType<Config>[] = [];
        await ConfigModel.find(
            {
                _id: {
                    $in: keys.map((k) => new mongoose.Types.ObjectId(k)),
                },
            },
            (err, docs) => {
                if (err) throw err;
                else res = docs;
            }
        ).lean();

        return keys.map(
            (k) =>
                res.find((d) => d._id.toString() === k) ||
                new Error('Could not find Config with id ' + k)
        );
    }
);

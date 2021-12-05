import { _FieldUnion } from './../Field/_FieldUnion';
import { FieldUnion } from './../Field/FieldUnion';
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Base } from '../Base/Base';

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
}

export const ConfigModel = getModelForClass(Config);

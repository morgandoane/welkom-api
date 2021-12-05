import { createUnionType, Field, ObjectType } from 'type-graphql';
import { Address } from '../Address/Address';
import {
    getModelForClass,
    modelOptions,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { Base } from '../Base/Base';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'locations',
    },
})
export class Location extends Base {
    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    company!: Ref<Company>;

    @Field(() => LocationIdentifier)
    @prop({ required: true })
    identifier!: LocationIdentifier_Address | LocationIdentifier_Name;
}

@ObjectType()
export class LocationIdentifier_Address {
    @Field(() => Address)
    @prop({ required: true })
    address!: Address;

    @prop({ required: true })
    type!: 'address';
}

@ObjectType()
export class LocationIdentifier_Name {
    @Field()
    @prop({ required: true })
    name!: string;

    @prop({ required: true })
    type!: 'name';
}

export const LocationIdentifier = createUnionType({
    name: 'LocationIdentifier',
    types: () => [LocationIdentifier_Address, LocationIdentifier_Name] as const,
});

export const LocationModel = getModelForClass(Location);

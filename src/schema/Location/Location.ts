import { getBaseLoader } from './../Loader';
import { createUnionType, Field, ObjectType } from 'type-graphql';
import { Address } from '../Address/Address';
import {
    DocumentType,
    getModelForClass,
    modelOptions,
    mongoose,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { Base } from '../Base/Base';
import DataLoader from 'dataloader';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'locations',
    },
})
export class Location extends Base {
    @Field(() => Company)
    @prop({ required: true, ref: 'Company' })
    company!: Ref<Company>;

    @Field(() => Address, { nullable: true })
    @prop({ required: false })
    address?: Address;

    @Field({ nullable: true })
    @prop({ required: false })
    label?: string;
}

export const LocationModel = getModelForClass(Location);

export const LocationLoader = getBaseLoader(LocationModel);

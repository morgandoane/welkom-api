import { getBaseLoader } from './../../utils/baseLoader';
import { Company } from '@src/schema/Company/Company';
import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import { Field, ObjectType } from 'type-graphql';
import { prop, Ref, getModelForClass } from '@typegoose/typegoose';
import { Address } from '../Address/Address';

@ObjectType()
export class Location extends UploadEnabled {
    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    company!: Ref<Company>;

    @Field()
    @prop({ required: true })
    label!: string;

    @Field(() => Address, { nullable: true })
    @prop({ required: false })
    address!: Address | null;
}

export const LocationModel = getModelForClass(Location);
export const LocationLoader = getBaseLoader(LocationModel);

import { ProductionLine } from './../ProductionLine/ProductionLine';
import { getBaseLoader } from './../Loader';
import { Field, ObjectType } from 'type-graphql';
import { Address } from '../Address/Address';
import {
    getModelForClass,
    modelOptions,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { Base } from '../Base/Base';
import { ObjectId } from 'mongoose';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'locations',
    },
})
export class Location extends Base {
    @Field(() => Company)
    @prop({ required: true, ref: 'Company' })
    company!: Ref<Company> | ObjectId;

    @Field(() => Address, { nullable: true })
    @prop({ required: false })
    address?: Address;

    @Field({ nullable: true })
    @prop({ required: false })
    label?: string;

    @Field(() => [ProductionLine], { nullable: true })
    production_lines?: ProductionLine[];
}

export const LocationModel = getModelForClass(Location);

export const LocationLoader = getBaseLoader(LocationModel);

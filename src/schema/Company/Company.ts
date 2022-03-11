import { Contact } from './../Contact/Contact';
import { getBaseLoader } from './../../utils/baseLoader';
import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import { modelOptions, prop, getModelForClass } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { MinLength } from 'class-validator';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'companies',
    },
})
export class Company extends UploadEnabled {
    @MinLength(2)
    @Field()
    @prop({ required: true, minlength: 2 })
    name!: string;

    @Field(() => [Contact])
    @prop({ required: true, type: () => Contact })
    contacts!: Contact[];

    @prop({ required: false, default: false })
    internal?: boolean;
}

export const CompanyModel = getModelForClass(Company);
export const CompanyLoader = getBaseLoader(CompanyModel);

import { Contact } from './../Contact/Contact';
import { Base } from './../Base/Base';
import { getBaseLoader } from './../Loader';
import { Field, ObjectType } from 'type-graphql';
import {
    getModelForClass,
    modelOptions,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Location } from '../Location/Location';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'companies',
    },
})
export class Company extends Base {
    @Field()
    @prop({ required: true })
    name!: string;

    @Field(() => [Location])
    locations?: Location[];

    @Field(() => [Contact])
    @prop({ required: true, ref: () => Contact })
    contacts: Ref<Contact>[];
}

export const CompanyModel = getModelForClass(Company);
export const CompanyLoader = getBaseLoader(CompanyModel);

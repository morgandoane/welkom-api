import { getBaseLoader } from './../Loader';
import { Field, ObjectType } from 'type-graphql';
import { Configured } from '../Configured/Configured';
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { Location } from '../Location/Location';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'companies',
    },
})
export class Company extends Configured {
    @Field()
    @prop({ required: true })
    name!: string;

    @Field(() => [Location])
    locations?: Location[];
}

export const CompanyModel = getModelForClass(Company);
export const CompanyLoader = getBaseLoader(CompanyModel);

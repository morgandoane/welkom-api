import { Field, ObjectType } from 'type-graphql';
import { Configured } from '../Configured/Configured';
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';

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

    @Field({ nullable: true })
    @prop({ required: false })
    picture?: string;
}

export const CompanyModel = getModelForClass(Company);

import { getBaseLoader } from '@src/utils/baseLoader';
import { Base } from '@src/schema/Base/Base';
import {
    index,
    modelOptions,
    prop,
    Ref,
    getModelForClass,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Company } from '../Company/Company';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'organizations',
    },
})
@index({ name: 1 }, { unique: true })
export class Organization extends Base {
    @Field()
    @prop({ required: true })
    name!: string;

    @Field(() => [Company])
    @prop({ required: true, ref: () => Company })
    companies!: Ref<Company>[];
}

export const OrganizationModel = getModelForClass(Organization);
export const OrganizationLoader = getBaseLoader(OrganizationModel);

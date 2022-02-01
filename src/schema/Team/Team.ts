import { getBaseLoader } from '@src/utils/baseLoader';
import { Permission } from '@src/auth/permissions';
import {
    prop,
    Ref,
    getModelForClass,
    modelOptions,
} from '@typegoose/typegoose';
import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import { Field, ObjectType } from 'type-graphql';
import { Company } from '../Company/Company';
import { Location } from '../Location/Location';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'teams',
    },
})
export class Team extends UploadEnabled {
    @Field()
    @prop({ required: true })
    name!: string;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    company!: Ref<Company>;

    @Field(() => Location, { nullable: true })
    @prop({ required: false, ref: () => Location })
    location!: Ref<Location> | null;

    @Field(() => [Permission])
    @prop({ required: true, type: String, enum: Permission })
    permissions!: Permission[];

    @Field(() => [String])
    @prop({ required: true, type: () => [String] })
    members!: string[];
}

export const TeamModel = getModelForClass(Team);
export const TeamLoader = getBaseLoader(TeamModel);

import { Profile } from './../Profile/Profile';
import { getBaseLoader } from './../Loader';
import { Permission } from '@src/auth/permissions';
import { Location } from './../Location/Location';
import { Company } from './../Company/Company';
import { Base } from '@src/schema/Base/Base';
import {
    modelOptions,
    prop,
    Ref,
    getModelForClass,
    Severity,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { ObjectId } from 'mongoose';

@modelOptions({
    schemaOptions: {
        collection: 'teams',
    },
    options: {
        allowMixed: Severity.ALLOW,
    },
})
@ObjectType()
export class Team extends Base {
    @Field()
    @prop({ required: true })
    name!: string;

    @Field({ nullable: true })
    @prop({ required: false })
    description?: string;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    company!: Ref<Company> | ObjectId;

    @Field(() => [Profile])
    @prop({ required: true, type: () => String })
    members!: string[];

    @Field(() => Location, { nullable: true })
    @prop({ required: false, ref: () => Location })
    location?: Ref<Location> | ObjectId;

    @Field(() => [Permission])
    @prop({ required: true })
    permissions!: Permission[];
}

export const TeamModel = getModelForClass(Team);

export const TeamLoader = getBaseLoader(TeamModel);

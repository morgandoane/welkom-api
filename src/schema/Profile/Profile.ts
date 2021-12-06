import { modelOptions, prop, Severity } from '@typegoose/typegoose';
import { User } from 'auth0';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class AppMetaData {
    @Field(() => Profile)
    @prop({ required: true })
    created_by!: string;

    @Field(() => Profile)
    @prop({ required: true })
    require_password_rest!: boolean;
}

@ObjectType()
export class UserMetaData {
    @Field()
    @prop({ required: false })
    prefers_dark_mode?: boolean;

    @Field()
    @prop({ required: false })
    phone_number?: string;
}

@modelOptions({
    options: {
        allowMixed: Severity.ALLOW,
    },
})
@ObjectType()
export class ProfileIdentityData {
    @Field({ nullable: true })
    @prop({ required: false })
    email?: string | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    email_verified?: boolean | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    name?: string | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    phone_number?: string | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    phone_verified?: boolean | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    request_language?: string | undefined;
}

@modelOptions({
    options: {
        allowMixed: Severity.ALLOW,
    },
})
@ObjectType()
export class ProfileIdentity {
    @Field()
    @prop()
    connection: string;

    @Field()
    @prop()
    user_id: string;

    @Field()
    @prop()
    provider: string;

    @Field()
    @prop()
    isSocial: boolean;

    @Field({ nullable: true })
    @prop({ required: false })
    access_token?: string | undefined;

    @Field(() => ProfileIdentityData, { nullable: true })
    @prop({ required: false })
    profileData?: ProfileIdentityData;
}

@modelOptions({
    options: {
        allowMixed: Severity.ALLOW,
    },
})
@ObjectType()
export class Profile implements User<AppMetaData, UserMetaData> {
    @Field()
    @prop({ required: true })
    email!: string;

    @Field()
    @prop({ required: false })
    name!: string;

    @Field({ nullable: true })
    @prop({ required: false })
    email_verified?: boolean | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    username?: string | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    phone_number?: string | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    phone_verified?: boolean | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    user_id?: string | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    _id?: string | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    created_at?: string | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    updated_at?: string | undefined;

    @Field(() => ProfileIdentity, { nullable: true })
    @prop({ required: false })
    identities?: ProfileIdentity[] | undefined;

    @prop({ required: false })
    app_metadata!: AppMetaData | undefined;

    @Field(() => UserMetaData, { nullable: true })
    @prop({ required: false })
    user_metadata?: UserMetaData | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    picture?: string | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    nickname?: string | undefined;

    @Field(() => [String], { nullable: true })
    @prop({ required: false })
    multifactor?: string[] | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    last_ip?: string | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    last_login?: string | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    last_password_reset?: string | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    logins_count?: number | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    blocked?: boolean | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    given_name?: string | undefined;

    @Field({ nullable: true })
    @prop({ required: false })
    family_name?: string | undefined;
}

import { Field, ObjectType } from 'type-graphql';
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { Identity } from 'auth0';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'users',
    },
})
export class User {
    @Field({ nullable: true })
    @prop({ required: false })
    email?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    email_verified?: boolean;

    @Field({ nullable: true })
    @prop({ required: false })
    username?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    phone_number?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    phone_verified?: boolean;

    @Field({ nullable: true })
    @prop({ required: false })
    user_id?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    created_at?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    updated_at?: string;

    // @Field({ nullable: true })
    // @prop({ required: false })
    // identities?: Identity[];

    @Field({ nullable: true })
    @prop({ required: false })
    picture?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    name?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    nickname?: string;

    @Field(() => [String], { nullable: true })
    @prop({ required: false })
    multifactor?: string[];

    @Field({ nullable: true })
    @prop({ required: false })
    last_ip?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    last_login?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    last_password_reset?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    logins_count?: number;

    @Field({ nullable: true })
    @prop({ required: false })
    blocked?: boolean;

    @Field({ nullable: true })
    @prop({ required: false })
    given_name?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    family_name?: string;
}

export const UserModel = getModelForClass(User);

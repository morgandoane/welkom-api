import { Identified } from '../Base/Base';
import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Contact extends Identified {
    @Field()
    @prop({ required: true })
    name!: string;

    @Field({ nullable: false })
    @prop({ required: true })
    email!: string;

    @Field({ nullable: true })
    @prop({ required: false })
    title?: string;

    @Field()
    @prop({ required: true })
    email_on_order!: boolean;

    @Field()
    @prop({ required: true })
    cc_on_order!: boolean;
}

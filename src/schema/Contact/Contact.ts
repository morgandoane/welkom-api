import { getBaseLoader } from './../Loader';
import { Base } from './../Base/Base';
import { Field, ObjectType } from 'type-graphql';
import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose';

@modelOptions({
    schemaOptions: {
        collection: 'contacts',
    },
})
@ObjectType()
export class Contact extends Base {
    @Field()
    @prop({ required: true })
    given_name!: string;

    @Field()
    @prop({ required: true })
    family_name!: string;

    @Field({ nullable: true })
    @prop({ required: false })
    email?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    email_on_order?: boolean;

    @Field({ nullable: true })
    @prop({ required: false })
    cc_on_order?: boolean;

    @Field({ nullable: true })
    @prop({ required: false })
    phone?: string;
}

export const ContactModel = getModelForClass(Contact);
export const ContactLoader = getBaseLoader(ContactModel);

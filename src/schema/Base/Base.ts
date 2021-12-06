import { Profile } from './../Profile/Profile';
import { mongoose, prop } from '@typegoose/typegoose';
import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export class Base {
    @Field(() => ID)
    @prop({ required: true })
    _id!: mongoose.Types.ObjectId;

    @Field()
    @prop({ required: true })
    date_created!: Date;

    @Field({ nullable: true })
    @prop({ required: false })
    date_modified?: Date;

    @Field(() => Profile)
    @prop({ required: true })
    created_by!: string;

    @Field(() => Profile, { nullable: true })
    @prop({ required: false })
    modified_by?: string;

    @Field()
    @prop({ required: true, default: false })
    deleted!: boolean;
}

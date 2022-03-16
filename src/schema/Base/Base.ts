import { Profile } from './../Profile/Profile';
import { prop, mongoose } from '@typegoose/typegoose';
import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export class Identified {
    @Field(() => ID)
    @prop({ required: true, type: () => mongoose.Types.ObjectId })
    _id!: mongoose.Types.ObjectId;
}

@ObjectType()
export class Base extends Identified {
    @Field()
    @prop({ required: true })
    date_created!: Date;

    @Field(() => Profile)
    @prop({ required: true })
    created_by!: string;

    @Field()
    @prop({ required: true, default: false })
    deleted!: boolean;

    @Field({ nullable: true })
    @prop({ required: false })
    note?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    issue?: string;
}

import { mongoose, prop, Ref } from '@typegoose/typegoose';
import { Field, ID, ObjectType } from 'type-graphql';
import { User } from '../User/User';

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

    @Field(() => User)
    @prop({ required: true })
    created_by!: Ref<User>;

    @Field(() => User, { nullable: true })
    @prop({ required: false })
    modified_by?: Ref<User>;

    @Field()
    @prop({ required: true, default: false })
    deleted!: boolean;
}

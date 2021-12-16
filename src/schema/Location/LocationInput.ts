import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId } from 'mongodb';
import { AddressInput } from './../Address/AddressInput';
import { Field, InputType } from 'type-graphql';
import { prop } from '@typegoose/typegoose';

@InputType()
export class CreateLocationInput {
    @Field(() => AddressInput, { nullable: true })
    @prop({ required: false })
    address?: AddressInput;

    @Field(() => ObjectIdScalar)
    @prop({ required: true })
    company!: ObjectId;

    @Field({ nullable: true })
    @prop({ required: false })
    label?: string;
}

@InputType()
export class UpdateLocationInput {
    @Field(() => AddressInput, { nullable: true })
    @prop({ required: false })
    address?: AddressInput;

    @Field({ nullable: true })
    @prop({ required: false })
    label?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    deleted?: boolean;
}

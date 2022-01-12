import { prop, Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { ObjectIdScalar } from '../ObjectIdScalar';
import { Machine } from './Machine';

@InputType()
export class CreateMachineInput {
    @Field()
    @prop({ required: true })
    name: string;

    @Field({ nullable: true })
    @prop({ required: false })
    description?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    link?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    part_number?: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    @prop({ required: false, ref: () => Machine })
    parent?: Ref<Machine>;
}

@InputType()
export class UpdateMachineInput {
    @Field({ nullable: true })
    @prop({ required: false })
    name?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    description?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    link?: string;

    @Field({ nullable: true })
    @prop({ required: false })
    part_number?: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    @prop({ required: false, ref: () => Machine })
    parent?: Ref<Machine>;
}

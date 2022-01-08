import { Base } from './../Base/Base';
import { Field, ObjectType } from 'type-graphql';
import { prop, Ref } from '@typegoose/typegoose';
import { Verification } from '../Verification/Verification';

@ObjectType()
export class Verified extends Base {
    @Field(() => Verification, { nullable: true })
    @prop({ required: false, ref: () => Verification })
    verification?: Ref<Verification>;
}

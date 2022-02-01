import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class NumberRange {
    @Field()
    @prop({ required: true })
    min!: number;

    @Field()
    @prop({ required: true })
    max!: number;
}

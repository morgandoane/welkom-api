import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Address {
    @Field()
    @prop({ required: true })
    line_1!: string;

    @Field({ nullable: true })
    @prop({ required: false })
    line_2?: string;

    @Field()
    @prop({ required: true })
    city!: string;

    @Field()
    @prop({ required: true })
    state!: string;

    @Field()
    @prop({ required: true })
    postal!: string;

    @Field()
    @prop({ required: true })
    country!: string;
}

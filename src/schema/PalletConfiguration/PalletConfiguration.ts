import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class PalletConfiguration {
    @Field()
    @prop({ required: true })
    capacity!: number;

    @Field()
    @prop({ required: true })
    name!: string;
}

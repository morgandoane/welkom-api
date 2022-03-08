import { Field, InputType } from 'type-graphql';
import { prop } from '@typegoose/typegoose';

@InputType()
export class HoldResolutionInput {
    @Field()
    @prop({ required: true })
    action!: string;
}

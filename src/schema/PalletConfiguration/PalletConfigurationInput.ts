import { prop } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';

@InputType()
export class PalletConfigurationInput {
    @Field()
    @prop({ required: true })
    capacity!: number;

    @Field()
    @prop({ required: true })
    name!: string;
}

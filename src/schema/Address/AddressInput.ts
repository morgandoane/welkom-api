import { prop } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';

@InputType()
export class CoordinateInput {
    @Field()
    @prop({ required: true })
    lat!: number;

    @Field()
    @prop({ required: true })
    lon!: number;
}

@InputType()
export class AddressInput {
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
    @prop({ required: false })
    country?: string;

    @Field(() => CoordinateInput, { nullable: true })
    @prop({ required: false })
    coordinate?: CoordinateInput;
}

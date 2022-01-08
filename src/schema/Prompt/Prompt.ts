import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

export enum PromptType {
    Boolean = 'Boolean',
    Number = 'Number',
    Text = 'Text',
}

@ObjectType()
export class Range {
    @Field()
    @prop({ required: true })
    min!: number;

    @Field()
    @prop({ required: true })
    max!: number;
}

@ObjectType()
export class Prompt {
    @Field(() => PromptType)
    @prop({ required: true })
    type!: PromptType;

    @Field()
    @prop({ required: true })
    phrase!: string;

    @Field({ nullable: true })
    @prop({ required: false })
    valid_boolean?: boolean;

    @Field(() => Range, { nullable: true })
    @prop({ required: false })
    valid_range?: Range;
}

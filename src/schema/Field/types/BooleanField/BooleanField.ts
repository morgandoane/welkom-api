import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { FieldType, FieldBase } from '../../Field';

export enum BooleanMethod {
    Switch = 'Switch',
    Answer = 'Answer',
}

@ObjectType()
export class BooleanField extends FieldBase {
    @Field(() => FieldType)
    @prop({ required: true })
    type!: FieldType.Boolean;

    @Field(() => BooleanMethod)
    @prop({ required: true, default: BooleanMethod.Answer })
    method!: BooleanMethod;
}

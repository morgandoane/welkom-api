import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { FieldType, FieldBase } from '../../Field';

@ObjectType()
export class NumberField extends FieldBase {
    @Field(() => FieldType)
    @prop({ required: true })
    type!: FieldType.Number;

    @Field({ nullable: true })
    @prop({ required: false })
    min?: number;

    @Field({ nullable: true })
    @prop({ required: false })
    max?: number;
}

import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { FieldType, FieldBase } from '../../Field';

@ObjectType()
export class PercentageField extends FieldBase {
    @Field(() => FieldType)
    @prop({ required: true })
    type!: FieldType.Percentage;
}

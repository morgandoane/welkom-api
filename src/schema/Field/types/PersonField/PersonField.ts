import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { FieldType, FieldBase } from '../../Field';

@ObjectType()
export class PersonField extends FieldBase {
    @Field(() => FieldType)
    @prop({ required: true })
    type!: FieldType.Person;
}

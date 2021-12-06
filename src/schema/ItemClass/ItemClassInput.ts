import { Field, InputType } from 'type-graphql';
import { FieldInput } from '../Field/FieldInput';

@InputType()
export class ItemClassInput {
    @Field()
    name!: string;

    @Field(() => [FieldInput])
    fields!: FieldInput[];
}

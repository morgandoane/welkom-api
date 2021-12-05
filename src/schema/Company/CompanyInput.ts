import { ConfiguredInput } from './../Configured/ConfiguredInput';
import { FieldValueInput } from './../Field/inputs/FieldValueInputs';
import { Field, InputType } from 'type-graphql';
import { _FieldValueUnion } from '../Field/Field';

@InputType()
export class CreateCompanyInput extends ConfiguredInput {
    @Field()
    name: string;

    @Field()
    config: string;

    @Field(() => [FieldValueInput])
    field_values: FieldValueInput[];
}

@InputType()
export class UpdateCompanyInput extends ConfiguredInput {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    deleted?: boolean;
}

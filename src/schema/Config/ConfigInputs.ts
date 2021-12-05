import { ConfigKey } from './Config';
import { Field, InputType } from 'type-graphql';
import { FieldInput } from '../Field/FieldInput';

@InputType()
export class ConfigInput {
    @Field(() => ConfigKey)
    key!: ConfigKey;

    @Field(() => [FieldInput])
    fields!: FieldInput[];
}

import { Context } from '@src/auth/context';
import { loaderResult } from './../../utils/loaderResult';
import { Config, ConfigLoader } from './../Config/Config';
import { FieldValueInput } from './../Field/inputs/FieldValueInputs';
import { Field, InputType } from 'type-graphql';
import { _FieldValueUnion } from '../Field/Field';
import { Configured } from './Configured';

@InputType()
export class ConfiguredInput {
    @Field()
    config: string;

    @Field(() => [FieldValueInput])
    field_values: FieldValueInput[];

    public async validate({ base }: Context): Promise<Configured> {
        const field_values: _FieldValueUnion[] = [];

        for (const input of this.field_values) {
            field_values.push(await input.validate());
        }

        const config = loaderResult(await ConfigLoader.load(this.config));

        const configCheck = Config.compare(config, field_values);

        if (configCheck.success == false) throw configCheck.error;

        return {
            ...base,
            field_values,
            config: config._id,
        };
    }
}

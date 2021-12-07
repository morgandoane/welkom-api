import { DocumentType, mongoose } from '@typegoose/typegoose';
import { ObjectId, UpdateQuery } from 'mongoose';
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

@InputType()
export class UpdateConfiguredInputValue {
    @Field()
    config: string;

    @Field(() => [FieldValueInput])
    field_values: FieldValueInput[];

    public async validate(): Promise<{
        config: mongoose.Types.ObjectId;
        field_values: _FieldValueUnion[];
    }> {
        const field_values: _FieldValueUnion[] = [];

        for (const input of this.field_values) {
            field_values.push(await input.validate());
        }

        const config = loaderResult(await ConfigLoader.load(this.config));

        const configCheck = Config.compare(config, field_values);

        if (configCheck.success == false) throw configCheck.error;

        return {
            field_values,
            config: config._id,
        };
    }
}

@InputType()
export class UpdateConfiguredInput {
    @Field({ nullable: true })
    deleted?: boolean;

    @Field(() => UpdateConfiguredInputValue, { nullable: true })
    configuration?: UpdateConfiguredInputValue;

    public async serializeConfiguredUpdate(): Promise<
        UpdateQuery<DocumentType<Configured>>
    > {
        let update: UpdateQuery<DocumentType<Configured>> = {};
        if (this.configuration) {
            update = { ...update, ...(await this.configuration.validate()) };
        }
        if (this.deleted !== undefined) {
            update = { ...update, deleted: this.deleted };
        }
        return update;
    }
}

import { modelOptions, prop, Ref, Severity } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Base } from '../Base/Base';
import { Config } from '../Config/Config';
import { FieldValueUnion, _FieldValueUnion } from '../Field/Field';

@modelOptions({
    options: {
        allowMixed: Severity.ALLOW,
    },
})
@ObjectType()
export class Configured extends Base {
    @Field(() => Config)
    @prop({ required: true, ref: () => Config })
    config: Ref<Config>;

    @Field(() => [FieldValueUnion])
    @prop({ required: true })
    field_values!: _FieldValueUnion[];
}

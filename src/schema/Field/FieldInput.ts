import { defaultIdentifierSchema } from './types/IdentifierField/IdentifierField';
import { BooleanMethod } from './types/BooleanField/BooleanField';
import { FieldType } from './Field';
import { Field, InputType } from 'type-graphql';
import { _FieldUnion } from './_FieldUnion';

@InputType()
export class FieldInput {
    @Field(() => FieldType)
    type: FieldType;

    @Field()
    key: string;

    @Field()
    required: boolean;

    public validate(): _FieldUnion {
        switch (this.type) {
            case FieldType.Boolean:
                return {
                    type: this.type,
                    required: this.required,
                    key: this.key,
                    method: BooleanMethod.Answer,
                };
            case FieldType.Identifier:
                return {
                    type: this.type,
                    required: this.required,
                    key: this.key,
                    schema: defaultIdentifierSchema,
                };
            case FieldType.Company:
            case FieldType.Date:
            case FieldType.Number:
            case FieldType.Percentage:
            case FieldType.Person:
            case FieldType.Text:
                return {
                    type: this.type,
                    required: this.required,
                    key: this.key,
                };
        }
    }
}

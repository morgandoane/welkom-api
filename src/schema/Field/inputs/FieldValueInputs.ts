import { ObjectIdScalar } from './../../ObjectIdScalar';
import { ObjectId } from 'mongodb';
import { CompanyLoader } from './../../Company/Company';
import { loaderResult } from './../../../utils/loaderResult';
import { mongoose } from '@typegoose/typegoose';
import {
    CompanyValue,
    _FieldValueUnion,
    BooleanValue,
    NumberValue,
    PercentageValue,
    PersonValue,
    TextValue,
    DateValue,
    IdentifierValue,
} from './../Field';
import { BooleanMethod } from './../types/BooleanField/BooleanField';
import { Field, InputType } from 'type-graphql';
import { FieldType } from '../Field';
import { Glyph } from '../types/IdentifierField/IdentifierField';
import { UserInputError } from 'apollo-server-errors';
import { UserLoader } from '@src/services/AuthProvider/AuthProvider';

@InputType()
export class FieldValueInput {
    @Field()
    key: string;

    @Field(() => FieldType)
    type: FieldType;

    @Field(() => BooleanMethod, { nullable: true })
    boolean_method?: BooleanMethod;

    @Field({ nullable: true })
    boolean_value?: boolean;

    @Field(() => ObjectIdScalar, { nullable: true })
    company_value?: ObjectId;

    @Field(() => Date, { nullable: true })
    date_value?: Date;

    @Field(() => [Glyph], { nullable: true })
    identifier_value?: Glyph[];

    @Field({ nullable: true })
    number_value?: number;

    @Field({ nullable: true })
    percentage_value?: number;

    @Field({ nullable: true })
    person_value?: string;

    @Field({ nullable: true })
    text_value?: string;

    public async validate(): Promise<_FieldValueUnion> {
        this.checkProvided();
        switch (this.type) {
            case FieldType.Boolean: {
                const res: BooleanValue = {
                    key: this.key,
                    type: this.type,
                    value: this.boolean_value,
                };
                return res;
            }
            case FieldType.Company: {
                const doc = loaderResult(
                    await CompanyLoader.load(this.company_value.toString())
                );
                const res: CompanyValue = {
                    key: this.key,
                    type: this.type,
                    value: new mongoose.Types.ObjectId(this.company_value),
                };
                return res;
            }
            case FieldType.Date: {
                const res: DateValue = {
                    key: this.key,
                    type: this.type,
                    value: this.date_value,
                };
                return res;
            }
            case FieldType.Identifier: {
                const res: IdentifierValue = {
                    key: this.key,
                    type: this.type,
                    value: this.identifier_value
                        ? this.identifier_value.join()
                        : '',
                };
                return res;
            }
            case FieldType.Number: {
                const res: NumberValue = {
                    key: this.key,
                    type: this.type,
                    value: this.number_value,
                };
                return res;
            }
            case FieldType.Percentage: {
                const res: PercentageValue = {
                    key: this.key,
                    type: this.type,
                    value: this.percentage_value,
                };
                return res;
            }
            case FieldType.Person: {
                const doc = loaderResult(
                    await UserLoader.load(this.person_value.toString())
                );
                const res: PersonValue = {
                    key: this.key,
                    type: this.type,
                    value: this.person_value,
                };
                return res;
            }
            case FieldType.Text: {
                const res: TextValue = {
                    key: this.key,
                    type: this.type,
                    value: this.text_value,
                };
                return res;
            }
        }
    }

    private checkProvided = (): void => {
        const schema: Record<
            FieldType,
            | null
            | undefined
            | boolean
            | string
            | Date
            | number
            | Glyph[]
            | ObjectId
        > = {
            Boolean: this.boolean_value,
            Company: this.company_value,
            Date: this.date_value,
            Identifier: this.identifier_value,
            Number: this.number_value,
            Percentage: this.percentage_value,
            Person: this.person_value,
            Text: this.text_value,
        };

        if (schema[this.type] === null || schema[this.type] === undefined) {
            throw new UserInputError(`Invalid ${this.type} input.`);
        }
    };
}

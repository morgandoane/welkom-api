import { RangeInput } from './../../Range/RangeInput';
import { ObjectIdScalar } from './../../ObjectIdScalar';
import { ObjectId } from 'mongodb';
import { DateRangeInput } from './../../DateRange/DateRangeInput';
import { DocumentType } from '@typegoose/typegoose';
import { _FieldValueUnion } from './../Field';
import { BooleanMethod } from './../types/BooleanField/BooleanField';
import { Field, InputType } from 'type-graphql';
import { FieldType } from '../Field';
import { Glyph } from '../types/IdentifierField/IdentifierField';
import { UserInputError } from 'apollo-server-errors';
import { FilterQuery } from 'mongoose';
import { Configured } from '@src/schema/Configured/Configured';

@InputType()
export class FieldValueFilter {
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

    @Field(() => DateRangeInput, { nullable: true })
    date_value?: DateRangeInput;

    @Field(() => [Glyph], { nullable: true })
    identifier_value?: Glyph[];

    @Field({ nullable: true })
    number_value?: RangeInput;

    @Field({ nullable: true })
    percentage_value?: number;

    @Field(() => ObjectIdScalar, { nullable: true })
    person_value?: ObjectId;

    @Field({ nullable: true })
    text_value?: string;

    public serialize(): FilterQuery<_FieldValueUnion> {
        this.checkProvided();
        const schema = {
            Boolean: this.boolean_value,
            Company: this.company_value,
            Date: this.date_value,
            Identifier: this.identifier_value,
            Number: this.number_value,
            Percentage: this.percentage_value,
            Person: this.person_value,
            Text: this.text_value,
        };

        if (this.type == FieldType.Number)
            return {
                key: this.key,
                type: this.type,
                value: {
                    $gte: this.number_value.min,
                    $lte: this.number_value.max,
                },
            };
        if (this.type == FieldType.Date)
            return {
                key: this.key,
                type: this.type,
                value: {
                    $gte: this.date_value.start,
                    $lte: this.date_value.end,
                },
            };
        if (this.type == FieldType.Identifier)
            return {
                key: this.key,
                type: this.type,
                value: this.identifier_value.join(),
            };
        else
            return {
                key: this.key,
                type: this.type,
                value: schema[this.type],
            } as FilterQuery<_FieldValueUnion>;
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
            | DateRangeInput
            | RangeInput
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

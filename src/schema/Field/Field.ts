import { Company } from './../Company/Company';
import { createUnionType, Field, ObjectType } from 'type-graphql';
import { prop, Ref } from '@typegoose/typegoose';
import { User } from '../User/User';

export enum FieldType {
    Boolean = 'Boolean',
    Company = 'Company',
    Date = 'Date',
    Identifier = 'Identifier',
    Number = 'Number',
    Percentage = 'Percentage',
    Person = 'Person',
    Text = 'Text',
}

@ObjectType()
export class FieldBase {
    @Field()
    @prop({ required: true })
    key!: string;

    @Field()
    @prop({ required: true })
    required!: boolean;
}

type FieldValueType<T> = T | null;

@ObjectType()
class ValueBase {
    @Field()
    @prop({ required: true })
    key!: string;
}

@ObjectType()
export class BooleanValue extends ValueBase {
    @Field(() => FieldType)
    @prop({ required: true })
    type!: FieldType.Boolean;

    @Field(() => Boolean, { nullable: true })
    @prop({ required: false })
    value!: FieldValueType<boolean>;
}

@ObjectType()
export class CompanyValue extends ValueBase {
    @Field(() => FieldType)
    @prop({ required: true })
    type!: FieldType.Company;

    @Field(() => String, { nullable: true })
    @prop({ required: false })
    value!: FieldValueType<Ref<Company>>;
}

@ObjectType()
export class DateValue extends ValueBase {
    @Field(() => FieldType)
    @prop({ required: true })
    type!: FieldType.Date;

    @Field(() => Date, { nullable: true })
    @prop({ required: false })
    value!: FieldValueType<Date>;
}

@ObjectType()
export class NumberValue extends ValueBase {
    @Field(() => FieldType)
    @prop({ required: true })
    type!: FieldType.Number;

    @Field(() => Number, { nullable: true })
    @prop({ required: false })
    value!: FieldValueType<number>;
}

@ObjectType()
export class PercentageValue extends ValueBase {
    @Field(() => FieldType)
    @prop({ required: true })
    type!: FieldType.Percentage;

    @Field(() => Number, { nullable: true })
    @prop({ required: false })
    value!: FieldValueType<number>;
}

@ObjectType()
export class PersonValue extends ValueBase {
    @Field(() => FieldType)
    @prop({ required: true })
    type!: FieldType.Person;

    @Field(() => String, { nullable: true })
    @prop({ required: false })
    value!: FieldValueType<Ref<User>>;
}

@ObjectType()
export class TextValue extends ValueBase {
    @Field(() => FieldType)
    @prop({ required: true })
    type!: FieldType.Text;

    @Field(() => String, { nullable: true })
    @prop({ required: false })
    value!: FieldValueType<string>;
}

@ObjectType()
export class IdentifierValue extends ValueBase {
    @Field(() => FieldType)
    @prop({ required: true })
    type!: FieldType.Identifier;

    @Field(() => String, { nullable: true })
    @prop({ required: false })
    value!: FieldValueType<string>;
}

export const FieldValueUnion = createUnionType({
    name: 'FieldValueUnion',
    types: () =>
        [
            BooleanValue,
            CompanyValue,
            DateValue,
            NumberValue,
            PercentageValue,
            PersonValue,
            TextValue,
            IdentifierValue,
        ] as const,
    resolveType: (value) => {
        switch (value.type) {
            case FieldType.Boolean:
                return BooleanValue;
            case FieldType.Company:
                return CompanyValue;
            case FieldType.Date:
                return DateValue;
            case FieldType.Identifier:
                return IdentifierValue;
            case FieldType.Number:
                return NumberValue;
            case FieldType.Percentage:
                return PercentageValue;
            case FieldType.Person:
                return PersonValue;
            case FieldType.Text:
                return TextValue;
        }
    },
});

export type _FieldValueUnion =
    | BooleanValue
    | CompanyValue
    | DateValue
    | NumberValue
    | PercentageValue
    | PersonValue
    | TextValue
    | IdentifierValue;

import { createUnionType } from 'type-graphql';
import { FieldType } from './Field';
import { BooleanField } from './types/BooleanField/BooleanField';
import { CompanyField } from './types/CompanyField/CompanyField';
import { DateField } from './types/DateField/DateField';
import { IdentifierField } from './types/IdentifierField/IdentifierField';
import { NumberField } from './types/NumberField/NumberField';
import { PercentageField } from './types/PercentageField/PercentageField';
import { PersonField } from './types/PersonField/PersonField';
import { TextField } from './types/TextField/TextField';

export const FieldUnion = createUnionType({
    name: 'FieldUnion',
    types: () =>
        [
            BooleanField,
            CompanyField,
            DateField,
            IdentifierField,
            NumberField,
            PercentageField,
            PersonField,
            TextField,
        ] as const,
    resolveType: (value) => {
        switch (value.type) {
            case FieldType.Boolean:
                return BooleanField;
            case FieldType.Company:
                return CompanyField;
            case FieldType.Date:
                return DateField;
            case FieldType.Identifier:
                return IdentifierField;
            case FieldType.Number:
                return NumberField;
            case FieldType.Percentage:
                return PercentageField;
            case FieldType.Person:
                return PersonField;
            case FieldType.Text:
                return TextField;
        }
    },
});

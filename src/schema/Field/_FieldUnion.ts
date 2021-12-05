import { BooleanField } from './types/BooleanField/BooleanField';
import { CompanyField } from './types/CompanyField/CompanyField';
import { DateField } from './types/DateField/DateField';
import { IdentifierField } from './types/IdentifierField/IdentifierField';
import { NumberField } from './types/NumberField/NumberField';
import { PercentageField } from './types/PercentageField/PercentageField';
import { PersonField } from './types/PersonField/PersonField';
import { TextField } from './types/TextField/TextField';

export type _FieldUnion =
    | BooleanField
    | CompanyField
    | DateField
    | IdentifierField
    | NumberField
    | PercentageField
    | PersonField
    | TextField;

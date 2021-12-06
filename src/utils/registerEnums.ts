import { Permission } from '@src/auth/permissions';
import { UserRole } from '@src/auth/UserRole';
import { BolAppointmentType } from '@src/schema/Bol/BolInput';
import { ConfigKey } from '@src/schema/Config/Config';
import { FieldType } from '@src/schema/Field/Field';
import { BooleanMethod } from '@src/schema/Field/types/BooleanField/BooleanField';
import { Glyph } from '@src/schema/Field/types/IdentifierField/IdentifierField';
import { UnitClass } from '@src/schema/Unit/Unit';
import { registerEnumType } from 'type-graphql';

export const registerEnums = (): void => {
    registerEnumType(Permission, { name: 'Permission' });
    registerEnumType(UserRole, { name: 'UserRole' });
    registerEnumType(ConfigKey, { name: 'ConfigKey' });
    registerEnumType(FieldType, { name: 'FieldType' });
    registerEnumType(BooleanMethod, { name: 'BooleanMethod' });
    registerEnumType(Glyph, { name: 'Glyph' });
    registerEnumType(UnitClass, { name: 'UnitClass' });
    registerEnumType(BolAppointmentType, { name: 'BolAppointmentType' });
};

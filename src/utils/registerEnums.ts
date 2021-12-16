import { SignedUrlCategory } from './../schema/SignedUrl/SignedUrl';
import { SignedUrlType } from '../schema/SignedUrl/SignedUrl';
import { Permission } from '@src/auth/permissions';
import { UserRole } from '@src/auth/UserRole';
import { BolAppointmentType } from '@src/schema/Bol/BolInput';
import { FulfillmentType } from '@src/schema/Fulfillment/Fulfillment';
import { UnitClass } from '@src/schema/Unit/Unit';
import { registerEnumType } from 'type-graphql';
import { FolderClass } from '@src/schema/Folder/Folder';

export const registerEnums = (): void => {
    registerEnumType(Permission, { name: 'Permission' });
    registerEnumType(UserRole, { name: 'UserRole' });
    registerEnumType(UnitClass, { name: 'UnitClass' });
    registerEnumType(BolAppointmentType, { name: 'BolAppointmentType' });
    registerEnumType(FulfillmentType, { name: 'FulfillmentType' });
    registerEnumType(FolderClass, { name: 'FolderClass' });
    registerEnumType(SignedUrlType, { name: 'SignedUrlType' });
    registerEnumType(SignedUrlCategory, { name: 'SignedUrlCategory' });
};

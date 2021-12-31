import { CodeType } from './../services/CodeGeneration/CodeGeneration';
import { Permission } from '@src/auth/permissions';
import { UserRole } from '@src/auth/UserRole';
import { FulfillmentType } from '@src/schema/Fulfillment/Fulfillment';
import { UnitClass } from '@src/schema/Unit/Unit';
import { registerEnumType } from 'type-graphql';
import { FolderClass } from '@src/schema/Folder/Folder';
import { SignedUrlAction } from '@src/schema/SignedUrl/SignedUrlResolvers';
import { BolStatus } from '@src/schema/Bol/Bol';

export enum StorageBucketProxy {
    ldbbakery_attachments = 'ldbbakery_attachments',
    ldbbakery_documents = 'ldbbakery_documents',
    ldbbakery_images = 'ldbbakery_images',
    ldbbakery_profiles = 'ldbbakery_profiles',
}

export const registerEnums = (): void => {
    registerEnumType(Permission, { name: 'Permission' });
    registerEnumType(UserRole, { name: 'UserRole' });
    registerEnumType(UnitClass, { name: 'UnitClass' });
    registerEnumType(FulfillmentType, { name: 'FulfillmentType' });
    registerEnumType(FolderClass, { name: 'FolderClass' });
    registerEnumType(StorageBucketProxy, { name: 'StorageBucketProxy' });
    registerEnumType(SignedUrlAction, { name: 'SignedUrlAction' });
    registerEnumType(CodeType, { name: 'CodeType' });
    registerEnumType(BolStatus, { name: 'BolStatus' });
};

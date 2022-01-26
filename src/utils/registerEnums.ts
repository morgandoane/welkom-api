import { VerificationStatus } from './../schema/Verification/Verification';
import { CodeType } from './../services/CodeGeneration/CodeGeneration';
import { Permission } from '@src/auth/permissions';
import { UserRole } from '@src/auth/UserRole';
import { FulfillmentType } from '@src/schema/Fulfillment/Fulfillment';
import { UnitClass } from '@src/schema/Unit/Unit';
import { registerEnumType } from 'type-graphql';
import { FolderClass } from '@src/schema/Folder/Folder';
import { SignedUrlAction } from '@src/schema/SignedUrl/SignedUrlResolvers';
import { BolStatus } from '@src/schema/Bol/Bol';
import { PromptType } from '@src/schema/Prompt/Prompt';
import { ExpenseKey } from '@src/schema/Expense/Expense';
import { ItemType } from '@src/schema/Item/Item';

export enum StorageBucketProxy {
    ldbbakery_attachments = 'ldbbakery_attachments',
    ldbbakery_documents = 'ldbbakery_documents',
    ldbbakery_images = 'ldbbakery_images',
    ldbbakery_profiles = 'ldbbakery_profiles',
    ldbbakery_workbooks = 'ldbbakery_workbooks',
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
    registerEnumType(PromptType, { name: 'PromptType' });
    registerEnumType(VerificationStatus, { name: 'VerificationStatus' });
    registerEnumType(ExpenseKey, { name: 'ExpenseKey' });
    registerEnumType(ItemType, { name: 'ItemType' });
};

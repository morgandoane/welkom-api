import { DesignCategory, DesignLocation } from './../schema/Design/Design';
import { StorageBucket } from './../services/CloudStorage/CloudStorage';
import { FolderClass } from './../schema/Folder/Folder';
import { QualityCheckCategory } from './../schema/QualityCheck/QualityCheck';
import { UnitClass } from './../schema/Unit/UnitClass';
import { BaseUnit } from './../schema/Unit/BaseUnit';
import { CodeType } from './../services/CodeGeneration/CodeGeneration';
import { Permission } from '@src/auth/permissions';
import { UserRole } from '@src/auth/UserRole';
import { registerEnumType } from 'type-graphql';
import { QualityCheckClass } from '@src/schema/QualityCheck/QualityCheck';
import { ExpenseClass } from '@src/schema/Expense/ExpenseClass';
import { FulfillmentType } from '@src/schema/Fulfillment/Fulfillment';
import { IngredientUnitClass } from '@src/schema/Item/extensions/Ingredient/Ingredient';

export const registerEnums = (): void => {
    registerEnumType(Permission, { name: 'Permission' });
    registerEnumType(UserRole, { name: 'UserRole' });
    registerEnumType(StorageBucket, { name: 'StorageBucket' });
    registerEnumType(CodeType, { name: 'CodeType' });
    registerEnumType(QualityCheckClass, { name: 'QualityCheckClass' });
    registerEnumType(QualityCheckCategory, { name: 'QualityCheckCategory' });
    registerEnumType(BaseUnit, { name: 'BaseUnit' });
    registerEnumType(UnitClass, { name: 'UnitClass' });
    registerEnumType(FolderClass, { name: 'FolderClass' });
    registerEnumType(ExpenseClass, { name: 'ExpenseClass' });
    registerEnumType(FulfillmentType, { name: 'FulfillmentType' });
    registerEnumType(DesignCategory, { name: 'DesignCategory' });
    registerEnumType(DesignLocation, { name: 'DesignLocation' });
    registerEnumType(IngredientUnitClass, { name: 'IngredientUnitClass' });
};

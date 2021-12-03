import { Permission } from '@src/auth/permissions';
import { registerEnumType } from 'type-graphql';

registerEnumType(Permission, { name: 'Permission' });

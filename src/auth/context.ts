import {
    AppStorage,
    AppStorageClass,
} from './../services/CloudStorage/CloudStorage';
import { Permission } from '@src/auth/permissions';
import jwt from 'jsonwebtoken';
import { mongoose } from '@typegoose/typegoose';
import { UserRole } from './UserRole';
import { Base } from '@src/schema/Base/Base';

export class Context {
    jwt: jwt.JwtPayload | null;
    authToken: string;
    roles: UserRole[];
    permissions: Permission[];
    storage: AppStorageClass;

    constructor(
        jwt: jwt.JwtPayload | null,
        authToken: string,
        roles: UserRole[],
        permissions: Permission[],
        storage: AppStorageClass
    ) {
        this.jwt = jwt;
        this.authToken = authToken;
        this.roles = roles;
        this.permissions = permissions;
        this.storage = storage;
    }

    public get base(): Base {
        return {
            _id: new mongoose.Types.ObjectId(),
            created_by: this.jwt.sub,
            modified_by: this.jwt.sub,
            date_created: new Date(),
            date_modified: new Date(),
            deleted: false,
        };
    }
}

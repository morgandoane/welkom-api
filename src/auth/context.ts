import { StorageClass } from './../services/CloudStorage/CloudStorage';
import { Permission } from '@src/auth/permissions';
import jwt from 'jsonwebtoken';
import { mongoose } from '@typegoose/typegoose';
import { UserRole } from './UserRole';
import { Base } from '@src/schema/Base/Base';
import { getId } from '@src/utils/getId';

export class Context {
    jwt: jwt.JwtPayload | null;
    authToken: string;
    roles: UserRole[];
    permissions: Permission[];
    storage: StorageClass;

    constructor(
        jwt: jwt.JwtPayload | null,
        authToken: string,
        roles: UserRole[],
        permissions: Permission[],
        storage: StorageClass
    ) {
        this.jwt = jwt;
        this.authToken = authToken;
        this.roles = roles;
        this.permissions = permissions;
        this.storage = storage;
    }

    public get base(): Base {
        return {
            ...getId(),
            created_by: this.jwt.sub,
            date_created: new Date(),
            deleted: false,
        };
    }
}

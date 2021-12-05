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

    constructor(
        jwt: jwt.JwtPayload | null,
        authToken: string,
        roles: UserRole[],
        permissions: Permission[]
    ) {
        this.jwt = jwt;
        this.authToken = authToken;
        this.roles = roles;
        this.permissions = permissions;
    }

    public get base(): Base {
        const split = this.jwt.sub.split('|');
        const id = split[split.length - 1];
        return {
            _id: new mongoose.Types.ObjectId(),
            created_by: new mongoose.Types.ObjectId(id),
            modified_by: new mongoose.Types.ObjectId(id),
            date_created: new Date(),
            date_modified: new Date(),
            deleted: false,
        };
    }
}

import DataLoader from 'dataloader';
import { Permission } from '@src/auth/permissions';
import jwt from 'jsonwebtoken';
import { mongoose } from '@typegoose/typegoose';
import { _Base } from '@src/services/Mongo/schema/_Base/_Base';
import { UserRole } from './UserRole';

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

    public get base(): _Base {
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

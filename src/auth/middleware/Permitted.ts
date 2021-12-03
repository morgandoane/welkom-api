import { Permission } from '@src/auth/permissions';
import { Context } from '@src/auth/context';
import { MiddlewareFn, ResolverData } from 'type-graphql';
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import { UserRole } from '../UserRole';

interface PermissionArg {
    type: 'permission';
    permission: Permission;
}

interface RoleArg {
    type: 'role';
    role: UserRole;
}

export function Permitted(arg?: RoleArg | PermissionArg): MiddlewareFn {
    return async (data: ResolverData<Context>, next) => {
        const { context, info } = data;

        if (!context.jwt)
            throw new AuthenticationError("Yikes! You're not logged in.");

        if (arg && !context.roles.includes(UserRole.Admin)) {
            if (
                arg.type === 'permission' &&
                !context.permissions.includes(arg.permission)
            ) {
                throw new ForbiddenError('Invalid permissions.');
            } else if (arg.type === 'role') {
                switch (arg.role) {
                    case UserRole.Admin: {
                        if (!context.roles.includes(UserRole.Admin))
                            throw new ForbiddenError('Invalid roles.');
                        break;
                    }
                    case UserRole.Manager: {
                        if (
                            !context.roles.includes(UserRole.Admin) &&
                            !context.roles.includes(UserRole.Manager)
                        )
                            throw new ForbiddenError('Invalid roles.');
                        break;
                    }
                    case UserRole.User: {
                        if (context.roles.length == 0)
                            throw new ForbiddenError('Invalid roles.');
                        break;
                    }
                }
            }
        }
        return next();
    };
}

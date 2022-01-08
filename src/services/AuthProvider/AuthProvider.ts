import { ForbiddenError } from 'apollo-server-express';
import { Context } from './../../auth/context';
import {
    Profile,
    ProfileModel,
    AppMetaData,
    UserMetaData,
} from './../../schema/Profile/Profile';
import { env } from '@src/config';
import { ManagementClient, Role, User } from 'auth0';
import DataLoader from 'dataloader';
import { mongoose, DocumentType } from '@typegoose/typegoose';
import { UpdateQuery } from 'mongoose';
import { UserRole, userRoleDescriptions } from '@src/auth/UserRole';

export const AuthProvider = new ManagementClient({
    domain: env.AUTH0_DOMAIN,
    clientId: env.AUTH0_CLIENT_ID,
    clientSecret: env.AUTH0_SECRET,
    scope: 'read:users update:users',
});

export const UserLoader = new DataLoader<string, Profile>(
    async (keys: readonly string[]) => {
        const docs = await ProfileModel.find({
            $or: [{ user_id: { $in: [...keys] } }, { _id: { $in: [...keys] } }],
        }).lean();

        if (docs.length === keys.length) {
            return keys.map(
                (key) =>
                    docs.find((d) => d.user_id === key) ||
                    new Error('Failed to find user with id ' + key)
            );
        } else {
            const cachedKeys = docs.map((d) => d.user_id + '');
            const missingKeys = [
                ...keys.filter((k) => !cachedKeys.includes(k)),
            ];

            const additionalDocs: Profile[] = [];

            for (const id of missingKeys) {
                const fromAuth0 = await AuthProvider.getUser({ id }).catch(
                    (err) => {
                        throw err;
                    }
                );
                additionalDocs.push(
                    await (
                        await ProfileModel.create({
                            ...fromAuth0,
                            _id: new mongoose.Types.ObjectId(),
                        })
                    ).toJSON()
                );
            }

            return keys.map(
                (key) =>
                    [...docs, ...additionalDocs].find(
                        (d) => d.user_id === key
                    ) || new Error('Failed to find user with id ' + key)
            );
        }
    }
);

export const synchronizeProfiles = async (): Promise<
    DocumentType<Profile>[]
> => {
    const loop = async (
        index: number,
        stack: User[]
    ): Promise<User<AppMetaData, UserMetaData>[]> => {
        const res = await AuthProvider.getUsers({
            per_page: 50,
            page: index,
        });

        stack = [...stack, ...res];

        if (res.length == 50) return await loop(index + 1, stack);
        else return stack as User<AppMetaData, UserMetaData>[];
    };

    const allUsers = await loop(0, []);

    const docs = [];

    for (const user of allUsers) {
        const roles = await AuthProvider.getUserRoles({
            id: user.user_id || '',
        });
        const upsert: UpdateQuery<DocumentType<Profile>> = {
            ...user,
            roles: roles.map((r) => r.name as UserRole),
        };
        const res = await ProfileModel.findOneAndUpdate(
            { user_id: user.user_id },
            upsert,
            {
                new: true,
                upsert: true,
            }
        );

        docs.push(res);
    }

    return docs;
};

export const assignUserRole = async (
    { roles: avaliable_roles }: Context,
    user_id: string,
    role: UserRole
): Promise<void> => {
    if (!avaliable_roles.includes(UserRole.Admin) && role !== UserRole.User) {
        throw new ForbiddenError('Forbidden user role.');
    }

    const authRoles = await AuthProvider.getRoles();

    const roleSchema: Record<UserRole, Role | null> = {
        [UserRole.Admin]:
            authRoles.find((r) => r.name == UserRole.Admin) || null,
        [UserRole.Manager]:
            authRoles.find((r) => r.name == UserRole.Manager) || null,
        [UserRole.User]: authRoles.find((r) => r.name == UserRole.User) || null,
    };

    for (const key of Object.keys(UserRole)) {
        const match = roleSchema[key as UserRole];
        if (!match) {
            // Auth0 is not yet configured for this Role
            roleSchema[key as UserRole] = await AuthProvider.createRole({
                name: key,
                description: userRoleDescriptions[key as UserRole],
            });
        }
    }

    await AuthProvider.removeRolesFromUser(
        { id: user_id },
        { roles: Object.values(roleSchema).map((r) => r.id || '') }
    );

    await AuthProvider.assignRolestoUser(
        { id: user_id },
        { roles: [roleSchema[role].id] }
    );
};

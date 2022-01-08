export enum UserRole {
    Admin = 'Admin',
    Manager = 'Manager',
    User = 'User',
}

export const userRoleDescriptions: Record<UserRole, string> = {
    [UserRole.Admin]: 'Full access to sensitive backend controls.',
    [UserRole.Manager]: 'LDB Management role.',
    [UserRole.User]: 'Basic app user. Permissions based on team assignments.',
};

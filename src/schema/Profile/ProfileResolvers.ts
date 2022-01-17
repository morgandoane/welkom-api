import { UserRole } from '@src/auth/UserRole';
import { ForbiddenError } from 'apollo-server-express';
import { randomNumber } from './../../utils/randomNumber';
import { Paginate } from '@src/schema/Paginate';
import { ProfileFilter } from './ProfileFilter';
import { ProfileList } from './ProfileList';
import { UserInputError } from 'apollo-server-errors';
import { loaderResult } from './../../utils/loaderResult';
import { Context } from '@src/auth/context';
import {
    assignUserRole,
    AuthProvider,
    synchronizeProfiles,
    UserLoader,
} from './../../services/AuthProvider/AuthProvider';
import {
    Profile,
    AppMetaData,
    UserMetaData,
    ProfileModel,
    UserMetaDataInput,
} from './Profile';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { CreateProfileInput, UpdateProfileInput } from './ProfileInput';
import { CreateUserData, Role, User, UserData } from 'auth0';
import { getModelForClass, mongoose } from '@typegoose/typegoose';
import { Permitted } from '@src/auth/middleware/Permitted';

@Resolver(() => Profile)
export class ProfileResolvers {
    @UseMiddleware(
        Permitted({
            type: 'role',
            role: UserRole.Manager,
        })
    )
    @Mutation(() => Profile)
    async createProfile(
        @Ctx() context: Context,
        @Arg('data')
        {
            given_name,
            family_name,
            email,
            username,
            phone_number,
            temporary_password: password,
            role,
        }: CreateProfileInput
    ): Promise<Profile> {
        const ProfileModel = getModelForClass(Profile);

        if (!username && !email)
            throw new UserInputError('Please provide a username or email.');

        const userData: UserData<AppMetaData, UserMetaData> = {
            username,
            email: email || `${username}@littledutchboy.com`,
            blocked: false,
            password,
            given_name,
            family_name,
            user_metadata: {
                prefers_dark_mode: true,
                phone_number,
            },
            app_metadata: {
                created_by: context.base.created_by,
                require_password_reset: true,
            },
        };

        const createUserData: CreateUserData = {
            connection: 'WELKOM',
            ...userData,
        };

        const auth0res = (await AuthProvider.createUser(createUserData).catch(
            (e) => {
                throw new UserInputError(e);
            }
        )) as User<AppMetaData, UserMetaData>;

        const profile: Profile = {
            _id: new mongoose.Types.ObjectId().toString(),
            ...auth0res,
            email: auth0res.email || '',
            family_name: auth0res.family_name || '',
            given_name: auth0res.given_name || '',
            name: auth0res.name || '',
            roles: [role],
            app_metadata: auth0res.app_metadata as AppMetaData,
        };

        await assignUserRole(context, auth0res.user_id || '', role);

        const res = await ProfileModel.create(profile);

        return res.toJSON();
    }

    @UseMiddleware(
        Permitted({
            type: 'role',
            role: UserRole.Manager,
        })
    )
    @Mutation(() => Profile)
    async updateProfile(
        @Ctx() context: Context,
        @Arg('id') id: string,
        @Arg('data')
        {
            role,
            given_name,
            family_name,
            email,
            username,
            phone_number,
            password,
        }: UpdateProfileInput
    ): Promise<Profile> {
        const ProfileModel = getModelForClass(Profile);
        const current = await ProfileModel.findOne({
            $or: [{ _id: id }, { user_id: id }],
        });
        const updateData: UserData<AppMetaData, UserMetaData> = {};

        if (given_name) updateData.given_name = given_name;
        if (username) updateData.username = username;
        if (password) updateData.password = password;
        if (family_name) updateData.family_name = family_name;
        if (email) {
            updateData.email = email;
        }
        if (phone_number) {
            updateData.user_metadata = {
                ...current.user_metadata,
                phone_number,
            };
        }

        await AuthProvider.updateUser({ id }, updateData);

        const profileUpdate: Partial<Profile> = { ...updateData };

        if (role) {
            await assignUserRole(context, id, role);
            profileUpdate.roles = [role];
        }

        const res = await ProfileModel.findOneAndUpdate(
            { $or: [{ _id: id }, { user_id: id }] },
            { ...profileUpdate },
            { new: true }
        );

        UserLoader.clear(id);

        return res.toJSON();
    }

    @UseMiddleware(
        Permitted({
            type: 'role',
            role: UserRole.Manager,
        })
    )
    @Query(() => Profile)
    async profile(@Arg('id') id: string): Promise<Profile> {
        return loaderResult(await UserLoader.load(id));
    }

    @UseMiddleware(
        Permitted({
            type: 'role',
            role: UserRole.Manager,
        })
    )
    @Query(() => ProfileList)
    async profiles(
        @Ctx() context: Context,
        @Arg('filter') filter: ProfileFilter
    ): Promise<ProfileList> {
        if (randomNumber(15, 1) == 1) {
            console.log('synchronizing profiles');
            await synchronizeProfiles();
        }
        return Paginate.paginate({
            model: ProfileModel,
            query: filter.serializeProfileFilter(context),
            sort: { name: 1 },
            skip: filter.skip,
            take: filter.take,
        });
    }

    @UseMiddleware(
        Permitted({
            type: 'role',
            role: UserRole.Manager,
        })
    )
    @Mutation(() => Profile)
    async blockProfile(@Arg('id') id: string): Promise<Profile> {
        const ProfileModel = getModelForClass(Profile);
        loaderResult(await UserLoader.load(id));
        await AuthProvider.updateUser({ id }, { blocked: true });
        const res = await ProfileModel.findByIdAndUpdate(
            id,
            { blocked: true },
            { new: true }
        );
        return res.toJSON();
    }

    @UseMiddleware(Permitted())
    @Mutation(() => UserMetaData)
    async updateUserPreferences(
        @Ctx() { jwt }: Context,
        @Arg('data') user_metadata: UserMetaDataInput
    ): Promise<UserMetaData> {
        const id = jwt.sub || '';
        loaderResult(await UserLoader.load(id));
        const res = await AuthProvider.updateUser({ id }, { user_metadata });
        return user_metadata;
    }

    @FieldResolver()
    name(@Root() profile: Profile): string {
        if (profile.given_name && profile.family_name)
            return `${profile.given_name} ${profile.family_name}`;
        if (profile.name) return profile.name;
        if (profile.email) return profile.email;
        return 'Anonymous user';
    }
}

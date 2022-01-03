import { Paginate } from '@src/schema/Paginate';
import { Pagination } from '@src/schema/Pagination/Pagination';
import { ProfileFilter } from './ProfileFilter';
import { ProfileList } from './ProfileList';
import { UserInputError } from 'apollo-server-errors';
import { loaderResult } from './../../utils/loaderResult';
import { Context } from '@src/auth/context';
import {
    AuthProvider,
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
} from 'type-graphql';
import { ProfileInput, UpdateProfileInput } from './ProfileInput';
import { CreateUserData, UserData } from 'auth0';
import { getModelForClass, mongoose } from '@typegoose/typegoose';

@Resolver(() => Profile)
export class ProfileResolvers {
    @Mutation(() => Profile)
    async createProfile(
        @Ctx() { base }: Context,
        @Arg('data')
        {
            given_name,
            family_name,
            email,
            phone_number,
            temporary_password: password,
            company,
        }: ProfileInput
    ): Promise<Profile> {
        const ProfileModel = getModelForClass(Profile);

        const userData: UserData<AppMetaData, UserMetaData> = {
            email,
            email_verified: false,
            verify_email: true,
            blocked: false,
            password,
            given_name,
            family_name,
            user_metadata: {
                prefers_dark_mode: true,
                phone_number,
            },
            app_metadata: {
                created_by: base.created_by,
                require_password_reset: true,
                company,
            },
        };

        const createUserData: CreateUserData = {
            connection: 'WELKOM',
            ...userData,
        };

        const auth0res = await AuthProvider.createUser(createUserData).catch(
            (e) => {
                throw new UserInputError(e);
            }
        );

        const res = await ProfileModel.create({
            _id: new mongoose.Types.ObjectId(),
            ...auth0res,
        });

        return res.toJSON();
    }

    @Mutation(() => Profile)
    async updateProfile(
        @Arg('id') id: string,
        @Arg('data')
        { given_name, family_name, email, phone_number }: UpdateProfileInput
    ): Promise<Profile> {
        const ProfileModel = getModelForClass(Profile);
        const current = loaderResult(await UserLoader.load(id));
        const updateData: UserData<AppMetaData, UserMetaData> = {};

        if (given_name) updateData.given_name = given_name;
        if (family_name) updateData.family_name = family_name;
        if (email) {
            updateData.email = email;
            updateData.email_verified = false;
        }
        if (phone_number) {
            updateData.user_metadata = {
                ...current.user_metadata,
                phone_number,
            };
        }

        await AuthProvider.updateUser({ id }, updateData);
        const res = await ProfileModel.findByIdAndUpdate(
            id,
            { ...updateData },
            { new: true }
        );

        return res.toJSON();
    }

    @Query(() => ProfileList)
    async profiles(@Arg('filter') filter: ProfileFilter): Promise<ProfileList> {
        return Paginate.paginate({
            model: ProfileModel,
            query: filter.name
                ? {
                      name: { $regex: new RegExp(filter.name, 'i') },
                  }
                : {},
            sort: { name: 1 },
            skip: filter.skip,
            take: filter.take,
        });
    }

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
        if (profile.name) return profile.name;
        if (profile.given_name && profile.family_name)
            return `${profile.given_name} ${profile.family_name}`;
        if (profile.email) return profile.email;
        return 'Anonymous user';
    }
}

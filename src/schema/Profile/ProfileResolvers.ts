import { loaderResult } from './../../utils/loaderResult';
import { Context } from '@src/auth/context';
import {
    AuthProvider,
    UserLoader,
} from './../../services/AuthProvider/AuthProvider';
import { Profile, AppMetaData, UserMetaData } from './Profile';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
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
                require_password_rest: true,
            },
        };

        const createUserData: CreateUserData = {
            connection: 'WELKOM',
            ...userData,
        };

        await AuthProvider.createUser(createUserData, (err, doc) => {
            if (err) throw err;
        });

        const res = await ProfileModel.create({
            ...userData,
            _id: new mongoose.Types.ObjectId(),
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
}

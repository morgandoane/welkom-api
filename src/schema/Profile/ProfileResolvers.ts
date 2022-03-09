import { loaderResult } from './../../utils/loaderResult';
import {
    assignUserRole,
    AuthProvider,
    synchronizeProfiles,
    UserLoader,
} from './../../services/AuthProvider/AuthProvider';
import { UpdateProfileInput } from './UpdateProfileInput';
import { ProfileFilter } from './ProfileFilter';
import { ProfileList } from './ProfileList';
import { Paginate } from '../Pagination/Pagination';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { createUploadEnabledResolver } from '../UploadEnabled/UploadEnabledResolvers';
import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { Permitted } from '@src/auth/middleware/Permitted';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { AppMetaData, Profile, ProfileModel, UserMetaData } from './Profile';
import { CreateProfileInput } from './CreateProfileInput';
import { UserRole } from '@src/auth/UserRole';
import { UserInputError } from 'apollo-server-express';
import { CreateUserData, User, UserData } from 'auth0';
import { getId } from '@src/utils/getId';
import { es } from 'date-fns/locale';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Profile)
export class ProfileResolvers extends UploadEnabledResolver {
    @UseMiddleware(Permitted({ type: 'role', role: UserRole.Manager }))
    @Query(() => ProfileList)
    async profiles(@Arg('filter') filter: ProfileFilter): Promise<ProfileList> {
        // await synchronizeProfiles();
        return await Paginate.paginate({
            model: ProfileModel,
            query: await filter.serializeProfileFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { family_name: 1 },
        });
    }

    @UseMiddleware(Permitted({ type: 'role', role: UserRole.Manager }))
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
    @Mutation(() => Profile)
    async createProfile(
        @Ctx() context: Context,
        @Arg('data', () => CreateProfileInput)
        data: CreateProfileInput
    ): Promise<Profile> {
        const userData = await data.validateProfile(context);

        const createUserData: CreateUserData = {
            connection: 'WELKOM',
            given_name: userData.given_name,
            family_name: userData.family_name,
            username:
                userData.username ||
                `${userData.given_name[0]}.${userData.family_name}`.substring(
                    0,
                    14
                ),
            email:
                userData.email ||
                `${userData.given_name[0]}.${userData.family_name}@littledutchboy.com`,
            password: data.temporary_password,
        };

        const auth0res = (await AuthProvider.createUser(createUserData).catch(
            (e) => {
                throw new UserInputError(e);
            }
        )) as User<AppMetaData, UserMetaData>;

        const profile: Profile = {
            _id: getId()._id.toString(),
            ...auth0res,
            email: auth0res.email || '',
            family_name: auth0res.family_name || '',
            given_name: auth0res.given_name || '',
            name: auth0res.name || '',
            roles: [data.role],
            app_metadata: auth0res.app_metadata as AppMetaData,
        };

        await assignUserRole(context, auth0res.user_id || '', data.role);

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
        @Arg('id', () => String) id: string,
        @Arg('data', () => UpdateProfileInput)
        data: UpdateProfileInput
    ): Promise<Profile> {
        const { roles, ...update } = await data.serializeProfileUpdate();

        await AuthProvider.updateUser({ id: id.toString() }, update);

        await assignUserRole(context, id, roles[0]);

        const { password, ...rest } = update;

        const profileUpdate: Partial<Profile> = { ...rest };

        const res = await ProfileModel.findOneAndUpdate(
            { $or: [{ _id: id }, { user_id: id }] },
            { ...profileUpdate },
            { new: true }
        );

        UserLoader.clear(id.toString());

        return res.toJSON();
    }
}

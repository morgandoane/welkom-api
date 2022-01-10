import { UserRole } from '@src/auth/UserRole';
import {
    modelOptions,
    prop,
    getModelForClass,
    Ref,
} from '@typegoose/typegoose';
import { CreateProfileInput } from '@src/schema/Profile/ProfileInput';
import { Context } from '@src/auth/context';
import {
    AppMetaData,
    Profile,
    ProfileModel,
    UserMetaData,
} from './../schema/Profile/Profile';
import { LegacyAccessLevel } from './accessLevel';
import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import { mongoose } from '@typegoose/typegoose';
import { LegacyPlant } from './plant';
import { CreateUserData, User, UserData } from 'auth0';
import { CreateTeamInput } from '@src/schema/Team/TeamInput';
import {
    assignUserRole,
    AuthProvider,
} from '@src/services/AuthProvider/AuthProvider';
import { UserInputError } from 'apollo-server-errors';
import { Team } from '@src/schema/Team/Team';
import { CompanyLoader } from '@src/schema/Company/Company';
import { LocationLoader } from '@src/schema/Location/Location';
import { loaderResult } from '@src/utils/loaderResult';
import { getBaseLoader } from '@src/schema/Loader';

const connection = createConnection(env.LEGACY_ATLAS_URL);

@modelOptions({
    schemaOptions: {
        collection: 'teams',
    },
    existingConnection: connection,
})
export class LegacyTeam {
    @prop({ required: true })
    name: string;

    @prop({ required: true, ref: 'LegacyPlant' })
    plants: Ref<LegacyPlant>[];

    @prop({ required: true })
    accessAllPlants: boolean;

    @prop({ required: true })
    accessAllLevels: boolean;

    @prop({ required: true, ref: 'LegacyAccessLevel' })
    memberAccessLevels: Ref<LegacyAccessLevel>[];

    @prop({ required: true, ref: 'LegacyUser' })
    members: Ref<LegacyUser>[];

    public async convert(
        context: Context,
        company: string,
        location?: string
    ): Promise<CreateTeamInput> {
        const legacyMembers = await LegacyUserModel.find({
            _id: {
                $in: this.members.map(
                    (m) => new mongoose.Types.ObjectId(m.toString())
                ),
            },
        });
        const newMembers = await ProfileModel.find({
            email: { $in: legacyMembers.map((mem) => mem.email) },
        });

        const teamMembers: string[] = [...newMembers.map((m) => m.user_id)];

        if (newMembers.length !== legacyMembers.length) {
            const missingMembers = legacyMembers.filter(
                (m) => !newMembers.map((m) => m.email).includes(m.email)
            );

            for (const {
                username,
                firstName,
                lastName,
                fullName,
                email,
                phone,
                password,
                cardId,
                activeCardId,
                active,
                requirePasswordReset,
                teams,
            } of missingMembers) {
                const userData: UserData<AppMetaData, UserMetaData> = {
                    email: email || undefined,
                    email_verified: false,
                    verify_email: true,
                    blocked: false,
                    password,
                    given_name: firstName,
                    family_name: lastName,
                    user_metadata: {
                        prefers_dark_mode: true,
                        phone_number: phone + '',
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

                const auth0res = (await AuthProvider.createUser(
                    createUserData
                ).catch((e) => {
                    throw new UserInputError(e);
                })) as User<AppMetaData, UserMetaData>;

                const profile: Profile = {
                    _id: new mongoose.Types.ObjectId().toString(),
                    ...auth0res,
                    email: auth0res.email || '',
                    family_name: auth0res.family_name || '',
                    given_name: auth0res.given_name || '',
                    name: auth0res.name || '',
                    roles: [UserRole.User],
                    app_metadata: auth0res.app_metadata as AppMetaData,
                };

                await assignUserRole(
                    context,
                    auth0res.user_id || '',
                    UserRole.User
                );

                const res = await ProfileModel.create(profile);

                teamMembers.push(res.user_id);
            }
        }

        const res: CreateTeamInput = {
            name: this.name,
            company,
            members: teamMembers,
            location,
            permissions: [],
            serialize: async ({
                base,
                permissions,
            }: Context): Promise<Team> => {
                const comp = loaderResult(await CompanyLoader.load(company));

                if (location) {
                    const loc = loaderResult(
                        await LocationLoader.load(location)
                    );

                    if (loc.company.toString() !== comp._id.toString())
                        throw new UserInputError(
                            'Location does not match company'
                        );
                }

                const doc: Team = {
                    ...base,
                    name: this.name,
                    company: comp._id,
                    location: location
                        ? new mongoose.Types.ObjectId(location)
                        : undefined,
                    permissions: [],
                    members: teamMembers,
                };

                return doc;
            },
        };

        return res;
    }
}

export const LegacyTeamModel = getModelForClass(LegacyTeam);

@modelOptions({
    schemaOptions: {
        collection: 'users',
    },
    existingConnection: connection,
})
export class LegacyUser {
    @prop({ required: true })
    _id: mongoose.Types.ObjectId;

    @prop({ required: true, unique: true })
    username: string;

    @prop({ required: true })
    firstName: string;

    @prop({ required: true })
    lastName: string;

    @prop({ required: true })
    fullName: string;

    @prop({ required: true })
    email: string;

    @prop({ required: true })
    phone: number;

    @prop({ required: true })
    password: string;

    @prop({ required: false })
    cardId: string;

    @prop({ required: true })
    activeCardId: boolean;

    @prop({ required: true })
    active: boolean;

    @prop({ required: true })
    requirePasswordReset: boolean;

    @prop({ required: true, ref: () => LegacyTeam })
    teams: Ref<LegacyTeam>[];

    public async convert(
        temporary_password: string
    ): Promise<CreateProfileInput> {
        return {
            given_name: this.firstName,
            family_name: this.lastName,
            email: this.email,
            phone_number: this.phone + '',
            role: UserRole.User,
            temporary_password,
        };
    }
}

export const LegacyUserModel = getModelForClass(LegacyUser);

export const LegacyUserLoader = getBaseLoader(LegacyUserModel);

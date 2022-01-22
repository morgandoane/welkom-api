import { Context } from './../../auth/context';
import { ProfileIdentifierInput } from './ProfileIdentifierInputs';
import { Permitted } from '@src/auth/middleware/Permitted';
import { createBaseResolver } from './../Base/BaseResolvers';
import { ProfileIdentifier, ProfileIdentifierModel } from './ProfileIdentifier';
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { Permission } from '@src/auth/permissions';
import { UserRole } from '@src/auth/UserRole';

const BaseResolver = createBaseResolver();
@Resolver(() => ProfileIdentifier)
export class ProfileIdentifierResolvers extends BaseResolver {
    @UseMiddleware(Permitted({ type: 'role', role: UserRole.Manager }))
    @Mutation(() => ProfileIdentifier)
    async createProfileIdentifier(
        @Ctx() context: Context,
        @Arg('data', () => ProfileIdentifierInput) data: ProfileIdentifierInput
    ): Promise<ProfileIdentifier> {
        const doc = await data.validate(context);
        await ProfileIdentifierModel.deleteMany({ profile: data.profile });
        const res = await ProfileIdentifierModel.create(doc);
        return res.toJSON();
    }

    @UseMiddleware(Permitted({ type: 'role', role: UserRole.Manager }))
    @Mutation(() => Boolean)
    async deleteProfileIdentifier(
        @Arg('user_id') user_id: string
    ): Promise<boolean> {
        await ProfileIdentifierModel.updateMany(
            { profile: user_id },
            { deleted: true }
        );
        return true;
    }
}

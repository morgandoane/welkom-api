import { Context } from '@src/auth/context';
import { Permitted } from '@src/auth/middleware/Permitted';
import { createBaseResolver } from './../Base/BaseResolvers';
import { UserPreference } from './UserPreference';
import { Ctx, Query, Resolver, UseMiddleware } from 'type-graphql';

const BaseResolver = createBaseResolver();

@Resolver(() => UserPreference)
export class UserPreferenceResolvers extends BaseResolver {
    @UseMiddleware(Permitted())
    @Query(() => UserPreference)
    async preferences(@Ctx() context: Context): Promise<UserPreference> {
        return await UserPreference.getForUser(context);
    }
}

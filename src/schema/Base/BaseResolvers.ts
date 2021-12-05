import { FieldResolver, Resolver, ResolverInterface, Root } from 'type-graphql';
import { User, UserLoader } from '../User/User';
import { Base } from './Base';

export const createBaseResolver = () => {
    @Resolver(() => Base, { isAbstract: true })
    abstract class BaseResolver implements ResolverInterface<Base> {
        @FieldResolver(() => User)
        async created_by(@Root() base: Base): Promise<User> {
            if (!base.created_by) return null;
            return await UserLoader.load(base.created_by.toString());
        }

        @FieldResolver(() => User)
        async modified_by(@Root() { modified_by }: Base): Promise<User> {
            if (!modified_by) return null;
            return await UserLoader.load(modified_by.toString());
        }
    }

    return BaseResolver;
};

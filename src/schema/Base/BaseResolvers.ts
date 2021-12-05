import { FieldResolver, Resolver, ResolverInterface, Root } from 'type-graphql';
import { Loader } from '../Loader';
import { Mongo } from '../Mongo';
import { User } from '../User/User';
import { Base } from './Base';

export const createBaseResolver = () => {
    @Resolver(() => Base, { isAbstract: true })
    abstract class BaseResolver implements ResolverInterface<Base> {
        @FieldResolver(() => User)
        async created_by(@Root() { created_by }: Base): Promise<User> {
            return await Loader.User.load(created_by.toString());
        }
    }

    return BaseResolver;
};

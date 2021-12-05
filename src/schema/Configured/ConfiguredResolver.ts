import { Config, ConfigLoader } from './../Config/Config';
import { FieldResolver, Resolver, ResolverInterface, Root } from 'type-graphql';
import { Configured } from './Configured';
import { Base } from '../Base/Base';
import { User, UserLoader } from '../User/User';

export const createConfiguredResolver = () => {
    @Resolver(() => Configured, { isAbstract: true })
    abstract class ConfiguredResolver implements ResolverInterface<Configured> {
        @FieldResolver(() => User)
        async created_by(@Root() base: Base): Promise<User> {
            return await UserLoader.load(base.created_by.toString());
        }

        @FieldResolver(() => User)
        async modified_by(@Root() { modified_by }: Base): Promise<User> {
            if (!modified_by) return null;
            return await UserLoader.load(modified_by.toString());
        }

        @FieldResolver(() => Config)
        async config(@Root() { config }: Configured): Promise<Config> {
            return await ConfigLoader.load(config.toString());
        }
    }

    return ConfiguredResolver;
};

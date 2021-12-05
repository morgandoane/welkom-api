import { Loader } from './../Loader';
import { Config } from './../Config/Config';
import { FieldResolver, Resolver, ResolverInterface, Root } from 'type-graphql';
import { createBaseResolver } from '../Base/BaseResolvers';
import { Configured } from './Configured';

const BaseResolver = createBaseResolver();

export const createConfiguredResolver = () => {
    @Resolver(() => Configured, { isAbstract: true })
    abstract class ConfiguredResolver
        extends BaseResolver
        implements ResolverInterface<Configured>
    {
        @FieldResolver(() => Config)
        async config(@Root() { config }: Configured): Promise<Config> {
            return await Loader.Config.load(config.toString());
        }
    }

    return ConfiguredResolver;
};

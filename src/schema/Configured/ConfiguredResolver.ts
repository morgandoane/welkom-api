import { Profile } from './../Profile/Profile';
import { Config, ConfigLoader } from './../Config/Config';
import { FieldResolver, Resolver, Root } from 'type-graphql';
import { Configured } from './Configured';
import { Base } from '../Base/Base';
import { UserLoader } from '@src/services/AuthProvider/AuthProvider';

export const createConfiguredResolver = () => {
    @Resolver(() => Configured, { isAbstract: true })
    abstract class ConfiguredResolver {
        @FieldResolver(() => Profile)
        async created_by(@Root() base: Base): Promise<Profile> {
            return await UserLoader.load(base.created_by);
        }

        @FieldResolver(() => Profile)
        async modified_by(@Root() { modified_by }: Base): Promise<Profile> {
            if (!modified_by) return null;
            return await UserLoader.load(modified_by);
        }

        @FieldResolver(() => Config)
        async config(@Root() { config }: Configured): Promise<Config> {
            return await ConfigLoader.load(config.toString());
        }
    }

    return ConfiguredResolver;
};

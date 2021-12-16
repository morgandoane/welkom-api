import { Profile } from './../Profile/Profile';
import { FieldResolver, Resolver, Root } from 'type-graphql';
import { Base } from './Base';
import { UserLoader } from '@src/services/AuthProvider/AuthProvider';

export const createBaseResolver = () => {
    @Resolver(() => Base, { isAbstract: true })
    abstract class BaseResolver {
        @FieldResolver(() => Profile)
        async created_by(@Root() base: Base): Promise<Profile> {
            if (!base.created_by) return null;
            return await UserLoader.load(base.created_by.toString());
        }

        @FieldResolver(() => Profile, { nullable: true })
        async modified_by?(@Root() { modified_by }: Base): Promise<Profile> {
            if (!modified_by) return null;
            return await UserLoader.load(modified_by.toString());
        }
    }

    return BaseResolver;
};

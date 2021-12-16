import { UserLoader } from '@src/services/AuthProvider/AuthProvider';
import { loaderResult } from '@src/utils/loaderResult';
import { Profile } from './../Profile/Profile';
import {
    FieldResolver,
    Resolver,
    ResolverInterface,
    Root,
    ID,
} from 'type-graphql';
import { AppFile } from './AppFile';

@Resolver(() => AppFile)
export class AppFileResolvers implements ResolverInterface<AppFile> {
    @FieldResolver(() => ID)
    async id(@Root() { file }: AppFile): Promise<string> {
        return file.metadata.id;
    }

    @FieldResolver()
    async name(@Root() { file }: AppFile): Promise<string> {
        return file.metadata.name;
    }

    @FieldResolver(() => Profile)
    async created_by(@Root() { file }: AppFile): Promise<Profile> {
        if (!file.metadata || !file.metadata.metadata.created_by) return null;
        return loaderResult(
            await UserLoader.load(file.metadata.metadata.created_by)
        );
    }

    @FieldResolver(() => Date)
    async date_created(@Root() { file }: AppFile): Promise<Date> {
        return new Date(file.metadata.timeCreated);
    }
}

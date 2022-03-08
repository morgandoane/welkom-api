import { AppMetaData } from './../Profile/Profile';
import {
    AppStorage,
    StorageBucket,
} from './../../services/CloudStorage/CloudStorage';
import { AppFile } from './../AppFile/AppFile';
import { UploadEnabled } from './UploadEnabled';
import { createBaseResolver } from '../Base/BaseResolvers';
import { FieldResolver, Resolver, Root } from 'type-graphql';
import { isAfter, isBefore } from 'date-fns';

export const createUploadEnabledResolver = () => {
    const BaseResolver = createBaseResolver();

    @Resolver(() => UploadEnabled, { isAbstract: true })
    abstract class UploadEnabledResolver extends BaseResolver {
        @FieldResolver(() => [AppFile])
        async files(@Root() base: UploadEnabled): Promise<AppFile[]> {
            const docs = await AppStorage.files(
                StorageBucket.ldbbakery_attachments,
                base._id.toString()
            );

            const res: AppFile[] = [];

            for (const doc of docs) {
                res.push(AppFile.fromFile(base._id.toString(), doc));
            }

            return res;
        }

        @FieldResolver(() => String, { nullable: true })
        async photo(@Root() base: UploadEnabled): Promise<string | null> {
            const potentialDocs = await AppStorage.files(
                StorageBucket.ldbbakery_profiles,
                base._id.toString()
            );

            const res: AppFile[] = [];

            for (const doc of potentialDocs) {
                if (doc) res.push(AppFile.fromFile(base._id.toString(), doc));
            }

            if (!res[0]) return null;
            else {
                const sorted = res.reduce((stack, item) => {
                    if (!item.doc.metadata.metadata.date_modified)
                        return [...stack];
                    if (stack.length == 0) return [item];
                    const lastDate = new Date(
                        stack[
                            stack.length - 1
                        ].doc.metadata.metadata.date_modified
                    );
                    const thisDate = new Date(
                        item.doc.metadata.metadata.date_modified
                    );

                    if (isBefore(lastDate, thisDate)) return [item];
                    else return stack;
                }, [] as AppFile[]);
                if (sorted[0])
                    return await AppStorage.signedReadUrl(
                        StorageBucket.ldbbakery_profiles,
                        base._id.toString(),
                        sorted[0].doc.metadata.name.replace(
                            base._id.toString() + '/',
                            ''
                        )
                    );
                return null;
            }
        }
    }

    return UploadEnabledResolver;
};

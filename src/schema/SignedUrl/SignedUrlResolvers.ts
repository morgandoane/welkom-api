import { Context } from '@src/auth/context';
import {
    AppStorage,
    StorageBucket,
} from './../../services/CloudStorage/CloudStorage';
import { Permitted } from '@src/auth/middleware/Permitted';
import { SignedUrl } from './SignedUrl';
import { Arg, Ctx, Query, Resolver, UseMiddleware } from 'type-graphql';

@Resolver(() => SignedUrl)
export class SignedUrlResolvers {
    @UseMiddleware(Permitted())
    @Query(() => SignedUrl)
    async signedUrl(
        @Ctx() { base: { created_by } }: Context,
        @Arg('filename') filename: string,
        @Arg('identifier') identifier: string,
        @Arg('bucket', () => StorageBucket) bucket: StorageBucket
    ): Promise<SignedUrl> {
        const timestamp = new Date();
        const url = await AppStorage.signedWriteUrl(
            timestamp,
            bucket,
            identifier,
            filename,
            created_by
        );

        return { timestamp, url };
    }
}

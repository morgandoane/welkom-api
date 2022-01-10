import { StorageBucket } from '@src/services/CloudStorage/CloudStorage';
import { SignedUrlConfig } from './SignedUrlConfig';
import { Context } from '@src/auth/context';
import { Arg, Ctx, Query, Resolver, UseMiddleware } from 'type-graphql';
import { SignedUrl } from './SignedUrl';
import { Permitted } from '@src/auth/middleware/Permitted';

export enum SignedUrlAction {
    write = 'write',
    read = 'read',
    delete = 'delete',
    resumable = 'resumable',
}

@Resolver(() => SignedUrl)
export class SignedUrlResolvers {
    @UseMiddleware(Permitted())
    @Query(() => SignedUrl)
    async signedUrl(
        @Ctx() { storage, jwt }: Context,
        @Arg('config') { category, prefix, name, action }: SignedUrlConfig
    ): Promise<SignedUrl> {
        return {
            url:
                action == 'read'
                    ? await storage.signedReadUrl(
                          category as unknown as StorageBucket,
                          prefix,
                          name
                      )
                    : await storage.signedWriteUrl(
                          category as unknown as StorageBucket,
                          prefix,
                          name,
                          jwt.sub || ''
                      ),
        };
    }

    @UseMiddleware(Permitted())
    @Query(() => [SignedUrl])
    async signedUrls(
        @Ctx() { storage, jwt }: Context,
        @Arg('configs', () => [SignedUrlConfig])
        configs: SignedUrlConfig[]
    ): Promise<SignedUrl[]> {
        const res: SignedUrl[] = [];
        for (const { category, prefix, name, action } of configs) {
            res.push({
                url:
                    action == 'read'
                        ? await storage.signedReadUrl(
                              category as unknown as StorageBucket,
                              prefix,
                              name
                          )
                        : await storage.signedWriteUrl(
                              category as unknown as StorageBucket,
                              prefix,
                              name,
                              jwt.sub || ''
                          ),
            });
        }

        return res;
    }
}

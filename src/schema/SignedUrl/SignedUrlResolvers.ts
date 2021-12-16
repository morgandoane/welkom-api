import { Context } from './../../auth/context';
import { CompanyLoader } from './../Company/Company';
import { loaderResult } from './../../utils/loaderResult';
import { Arg, Ctx, Query, Resolver } from 'type-graphql';
import { SignedUrl, SignedUrlType, SignedUrlCategory } from './SignedUrl';

@Resolver(() => SignedUrl)
export class SignedUrlResolvers {
    @Query(() => [SignedUrl])
    async signedUrls(
        @Ctx() context: Context,
        @Arg('filenames', () => [String]) filenames: string[],
        @Arg('type', () => SignedUrlType) type: SignedUrlType,
        @Arg('category', () => SignedUrlCategory) category: SignedUrlCategory,
        @Arg('identifier') identifier: string
    ): Promise<SignedUrl[]> {
        let bucket;
        switch (category) {
            case SignedUrlCategory.Company: {
                const company = loaderResult(
                    await CompanyLoader.load(identifier)
                );
                bucket = company._id.toString();
            }
        }

        const res = [];

        switch (type) {
            case SignedUrlType.Read: {
                for (const filename of filenames) {
                    res.push(
                        await context.storage.signedReadUrl(
                            filename,
                            bucket,
                            context
                        )
                    );
                }
            }
            case SignedUrlType.Write: {
                for (const filename of filenames) {
                    res.push(
                        await context.storage.signedWriteUrl(
                            filename,
                            bucket,
                            context
                        )
                    );
                }
            }
        }

        return res;
    }
}

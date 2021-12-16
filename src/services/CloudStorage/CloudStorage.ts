import { Context } from '@src/auth/context';
import {
    CreateBucketResponse,
    GetFilesResponse,
    GetSignedUrlConfig,
    Storage,
    StorageOptions,
} from '@google-cloud/storage';
import { SignedUrl, SignedUrlType } from '@src/schema/SignedUrl/SignedUrl';
import { addHours, addMinutes } from 'date-fns';

const storageOptions: StorageOptions = {
    projectId: process.env.GOOGLE_STORAGE_PROJECT_ID,
    credentials: {
        client_email: process.env.GOOGLE_STORAGE_EMAIL,
        private_key: process.env.GOOGLE_STORAGE_PRIVATE_KEY,
    },
};

export class AppStorageClass {
    private storage: Storage;

    constructor() {
        this.storage = new Storage(storageOptions);
    }

    public async createBucket(name: string): Promise<CreateBucketResponse> {
        return await this.storage
            .createBucket(name, {
                location: 'US-WEST3',
                cors: [
                    {
                        origin: ['*'],
                        responseHeader: ['*'],
                        method: ['GET', 'PUT', 'POST', 'HEAD'],
                        maxAgeSeconds: 3600,
                    },
                ],
            })
            .catch((e) => {
                throw e;
            });
    }

    public async bucketContents(
        bucket_name: string
    ): Promise<GetFilesResponse> {
        return this.storage
            .bucket(bucket_name)
            .getFiles({})
            .then((res: GetFilesResponse) => {
                return res;
            })
            .catch((error) => {
                return this.createBucket(bucket_name).then((newBucket) => {
                    return newBucket[0].getFiles();
                });
            })
            .catch((error) => {
                throw error;
            });
    }

    public async signedWriteUrl(
        filename: string,
        bucket: string,
        context: Context
    ): Promise<SignedUrl> {
        const expires = addHours(new Date(), 15);

        const options: GetSignedUrlConfig = {
            version: 'v4',
            action: 'write',
            expires,
            extensionHeaders: {
                'x-goog-meta-created_by': context.jwt.sub,
            },
        };

        const [url] = await this.storage
            .bucket(bucket)
            .file(filename)
            .getSignedUrl(options)
            .catch((e) => {
                throw e;
            });

        return { url, expires, type: SignedUrlType.Write, filename };
    }

    public async signedReadUrl(
        filename: string,
        bucket: string,
        context: Context
    ): Promise<SignedUrl> {
        const expires = addMinutes(new Date(), 15);
        const options: GetSignedUrlConfig = {
            version: 'v4',
            action: 'read',
            expires,
        };

        const [url] = await this.storage
            .bucket(bucket)
            .file(filename)
            .getSignedUrl(options)

            .catch((e) => {
                throw e;
            });

        return { url, expires, type: SignedUrlType.Read, filename };
    }
}

export const AppStorage = new AppStorageClass();

import { addMinutes } from 'date-fns';
import { CloudStorageError } from './CloudStorageError';
import {
    Bucket,
    File,
    GetSignedUrlConfig,
    Storage,
} from '@google-cloud/storage';
import { CreateBucketRequest } from '@google-cloud/storage/build/src/storage';

export enum StorageBucket {
    Attachments = 'ldbbakery_attachments',
    Documents = 'ldbbakery_documents',
    Images = 'ldbbakery_images',
    Profiles = 'ldbbakery_profiles',
}

export type StorageRecord = Record<StorageBucket, CreateBucketRequest>;

const defaultConfig: CreateBucketRequest = {
    cors: [
        {
            origin: ['*'],
            responseHeader: ['*'],
            method: ['GET', 'PUT', 'POST', 'HEAD'],
            maxAgeSeconds: 3600,
        },
    ],
    versioning: {
        enabled: true,
    },
    location: 'US-WEST3',
};

const StorageSchema: StorageRecord = {
    [StorageBucket.Attachments]: { ...defaultConfig },
    [StorageBucket.Documents]: { ...defaultConfig },
    [StorageBucket.Images]: { ...defaultConfig },
    [StorageBucket.Profiles]: { ...defaultConfig },
};

export class StorageClass {
    private storage: Storage;

    constructor() {
        this.storage = new Storage({
            projectId: process.env.GOOGLE_STORAGE_PROJECT_ID,
            credentials: {
                client_email: process.env.GOOGLE_STORAGE_EMAIL,
                private_key: process.env.GOOGLE_STORAGE_PRIVATE_KEY.replace(
                    /\\n/gm,
                    '\n'
                ),
            },
        });
    }

    public async files(
        bucket_name: StorageBucket,
        prefix: string
    ): Promise<File[]> {
        const bucket = await this.bucket(bucket_name);
        const [files] = await bucket.getFiles({
            prefix,
        });

        return files;
    }

    public async signedWriteUrl(
        bucket_name: StorageBucket,
        folder: string,
        filename: string,
        identity: string,
        action: GetSignedUrlConfig['action'] = 'write'
    ): Promise<string> {
        const expires = addMinutes(new Date(), 30);
        const bucket = await this.bucket(bucket_name);

        const [url] = await bucket
            .file(this.filename(folder, filename))
            .getSignedUrl({
                version: 'v4',
                action,
                expires,
                extensionHeaders: {
                    'x-goog-meta-created_by': identity,
                },
            })
            .catch((e) => {
                throw new CloudStorageError(e);
            });

        return url;
    }

    public async signedReadUrl(
        bucket_name: StorageBucket,
        folder: string,
        filename: string
    ): Promise<string> {
        const expires = addMinutes(new Date(), 30);

        const bucket = await this.bucket(bucket_name);

        const file = bucket.file(
            this.filename(folder, filename.replace(folder + '/', ''))
        );

        const [url] = await file
            .getSignedUrl({
                version: 'v4',
                action: 'read',
                expires,
            })
            .catch((e) => {
                throw new CloudStorageError(e);
            });

        return url;
    }

    public async deleteFile(
        bucket_name: StorageBucket,
        folder: string,
        filename: string
    ): Promise<void> {
        const bucket = await this.bucket(bucket_name);
        const file = bucket.file(
            this.filename(folder, filename.replace(folder + '/', ''))
        );
        await file.delete().catch((e) => {
            throw new CloudStorageError(e);
        });
    }

    private async bucket(bucket_name: StorageBucket): Promise<Bucket> {
        const bucket = this.storage.bucket(bucket_name);
        const [exists] = await bucket.exists();
        if (exists) return bucket;
        else {
            const [newBucket] = await this.storage
                .createBucket(bucket_name, StorageSchema[bucket_name])
                .catch((error) => {
                    console.log(error);
                    throw new CloudStorageError(error);
                });

            return newBucket;
        }
    }

    private filename(folder: string, filename: string) {
        return `${folder}/${filename}`;
    }
}

export const AppStorage = new StorageClass();

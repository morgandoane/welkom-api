import { ForgeCacheModel } from './utils/ForgeCache';
import ForgeSDK from 'forge-apis';
import { File } from '@google-cloud/storage';

import fs from 'fs';
import { sleep } from '@src/utils/sleep';
import { convertNodeHttpToRequest } from 'apollo-server-core';

const { BucketsApi, ObjectsApi, DerivativesApi } = ForgeSDK;

class ForgeBaseClass {
    _client: ForgeSDK.AuthClientTwoLegged;
    _bucketsApi: ForgeSDK.BucketsApi;
    _objectsApi: ForgeSDK.ObjectsApi;
    _derivativesApi: ForgeSDK.DerivativesApi;

    constructor() {
        this._client = new ForgeSDK.AuthClientTwoLegged(
            process.env.FORGE_CLIENT_ID,
            process.env.FORGE_CLIENT_SECRET,
            [
                'viewables:read',
                'data:read',
                'data:write',
                'data:create',
                'data:search',
                'bucket:create',
                'bucket:read',
                'bucket:update',
                'bucket:delete',
                'code:all',
            ],
            true
        );

        this._bucketsApi = new BucketsApi();
        this._objectsApi = new ObjectsApi();
        this._derivativesApi = new DerivativesApi();
    }

    async credentials(): Promise<ForgeSDK.AuthToken> {
        let res;
        await this._client.authenticate().then((token) => {
            res = token;
        });
        return res;
    }
}

export interface ForgeBucketStructure {
    bucketKey: string;
    bucketOwner: string;
    createdDate: number;
}

export interface ForgeObjectStructure {
    bucketKey?: string;
    objectId?: string;
    objectKey?: string;
    sha1?: string;
    size?: number;
    contentType?: string;
    location?: string;
}

export class ForgeObject
    extends ForgeBaseClass
    implements ForgeObjectStructure
{
    bucketKey?: string;
    objectId?: string;
    objectKey?: string;
    sha1?: string;
    size?: number;
    contentType?: string;
    location?: string;

    constructor(arg: ForgeObjectStructure) {
        super();
        this.bucketKey = arg.bucketKey;
        this.objectId = arg.objectId;
        this.objectKey = arg.objectKey;
        this.sha1 = arg.sha1;
        this.size = arg.size;
        this.contentType = arg.contentType;
        this.location = arg.location;
    }

    public async svf2(): Promise<{ urn: string; token: string }> {
        const creds = await this.credentials();

        const cached = await ForgeCacheModel.findOne({
            urn: this.objectId,
        });

        if (cached) {
            return { urn: cached.derivative_urn, token: creds.access_token };
        }

        let jobUrn;

        const jobRes = await this._derivativesApi
            .translate(
                {
                    input: {
                        urn: this.encodeUrn(),
                    },
                    output: {
                        formats: [
                            {
                                type: 'svf2',
                                views: ['3d'],
                            },
                        ],
                    },
                },
                {},
                this._client,
                creds
            )
            .then((data) => {
                jobUrn = data.body.urn;
            })
            .catch((e) => console.log(e));

        const checkCompletion = async (): Promise<{ urn: string }> => {
            await sleep(1000);
            let res;
            await this._derivativesApi
                .getManifest(this.encodeUrn(), {}, this._client, creds)
                .then((data) => {
                    res = data;
                })
                .catch((err) => {
                    console.log(err);
                });
            const { status, urn } = res.body;
            if (status == 'inprogress' || status == 'pending')
                return await checkCompletion();
            else if (status == 'failed' || status == 'timeout')
                throw new Error('Failed to translate file.');
            else {
                await ForgeCacheModel.create({
                    derivative_urn: urn,
                    urn: this.objectId,
                });
                return { urn };
            }
        };

        return { ...(await checkCompletion()), token: creds.access_token };
    }

    public encodeUrn(): string {
        return Buffer.from(this.objectId).toString('base64url');
    }
}

export class ForgeBucket
    extends ForgeBaseClass
    implements ForgeBucketStructure
{
    bucketKey: string;
    bucketOwner: string;
    createdDate: number;

    constructor(arg: ForgeBucketStructure) {
        super();
        this.bucketKey = arg.bucketKey;
        this.bucketOwner = arg.bucketOwner;
        this.createdDate = arg.createdDate;
    }

    public async object(objectName: string): Promise<ForgeObject | null> {
        let object;
        const res = await this._objectsApi
            .getObjectDetails(
                this.bucketKey,
                objectName,
                {},
                this._client,
                await this.credentials()
            )
            .then((data) => (object = new ForgeObject(data.body)))
            .catch((e) => {
                console.log(e);
                object = null;
            });

        return object;
    }

    public async uploadObject(file: File): Promise<ForgeObject | null> {
        let buffer: Buffer;

        await file.download({}).then((data) => {
            buffer = data[0];
        });

        const res = await this._objectsApi.uploadObject(
            this.bucketKey,
            file.metadata.name,
            buffer.length,
            buffer,
            {},
            this._client,
            await this.credentials()
        );

        return new ForgeObject(res.body);
    }
}

class ForgeClass extends ForgeBaseClass {
    constructor() {
        super();
    }

    public async buckets(): Promise<ForgeBucketStructure[]> {
        const credentials = await this.credentials();
        const data = await this._bucketsApi.getBuckets(
            {},
            this._client,
            credentials
        );
        return data.body.items;
    }

    public async bucket(id: string): Promise<ForgeBucket> {
        // 1) Authenticate
        const credentials = await this.credentials();

        // 2) try to find the bucket in list
        const res = await this._bucketsApi.getBuckets(
            {},
            this._client,
            credentials
        );

        const buckets: ForgeBucketStructure[] = res.body.items;

        const match = buckets.find(
            (b) => b.bucketKey == process.env.FORGE_BUCKET_PREFIX + id
        );

        if (match) {
            return new ForgeBucket(match);
        }

        // 3) if bucket does not exist, create it

        const createRes = await this._bucketsApi.createBucket(
            {
                bucketKey: process.env.FORGE_BUCKET_PREFIX + id,
                policyKey: 'persistent',
            },
            {},
            this._client,
            credentials
        );

        const newBucket: ForgeBucketStructure = createRes.body;

        return new ForgeBucket(newBucket);
    }
}

export const Forge = new ForgeClass();

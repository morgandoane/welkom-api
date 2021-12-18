import { StorageBucketProxy } from '@src/utils/registerEnums';
import { Field, InputType } from 'type-graphql';
import { SignedUrlAction } from './SignedUrlResolvers';

@InputType()
export class SignedUrlConfig {
    @Field(() => StorageBucketProxy)
    category: StorageBucketProxy;

    @Field(() => SignedUrlAction)
    action: SignedUrlAction;

    @Field()
    prefix: string;

    @Field()
    name: string;
}

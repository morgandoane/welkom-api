import { StorageBucketProxy } from '@src/utils/registerEnums';
import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class DeleteFileArgs {
    @Field(() => StorageBucketProxy)
    category: StorageBucketProxy;

    @Field()
    folder: string;

    @Field()
    name: string;
}

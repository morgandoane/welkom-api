import { ConfigKey } from './Config';
import { Field, InputType } from 'type-graphql';
import { PaginateArg } from '../Pagination/Pagination';

@InputType()
export class ConfigFilter extends PaginateArg {
    @Field(() => ConfigKey, { nullable: true })
    key?: ConfigKey;

    @Field({ nullable: true })
    only_active?: boolean;
}

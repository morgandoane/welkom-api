import { Field, InputType } from 'type-graphql';
import { PaginateArg } from '../Pagination/Pagination';

@InputType()
export class ItemClassFilter extends PaginateArg {
    @Field({ nullable: true })
    deleted?: boolean;
}

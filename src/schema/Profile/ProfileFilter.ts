import { PaginateArg } from './../Pagination/Pagination';
import { Field, InputType } from 'type-graphql';

@InputType()
export class ProfileFilter extends PaginateArg {
    @Field({ nullable: true })
    name?: string;
}

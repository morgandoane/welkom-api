import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId } from 'mongodb';
import { Field, InputType } from 'type-graphql';
import { PaginateArg } from '../Pagination/Pagination';

@InputType()
export class ItemFilter extends PaginateArg {
    @Field({ nullable: true })
    name?: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    class?: ObjectId;
}

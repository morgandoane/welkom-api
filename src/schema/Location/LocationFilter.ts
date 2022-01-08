import { ObjectId } from 'mongodb';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Field, InputType } from 'type-graphql';
import { PaginateArg } from '../Pagination/Pagination';

@InputType()
export class LocationFIlter extends PaginateArg {
    @Field(() => ObjectIdScalar, { nullable: true })
    company?: ObjectId;

    @Field({ nullable: true })
    label?: string;

    @Field({ nullable: true })
    mine?: boolean;
}

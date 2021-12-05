import { FilterQuery } from 'mongoose';
import { ClassType, Field, InputType, Int, ObjectType } from 'type-graphql';

export const Pagination = <TItem>(TItemClass: ClassType<TItem>) => {
    @ObjectType({ isAbstract: true })
    abstract class PaginatedResponseClass {
        @Field((type) => [TItemClass])
        items: TItem[];

        @Field((type) => Int)
        count: number;
    }
    return PaginatedResponseClass;
};

@InputType()
export class PaginateArg {
    @Field()
    skip: number;

    @Field()
    take: number;
}

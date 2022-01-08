import { BaseFilter } from './../Base/BaseFilter';
import { Field, InputType } from 'type-graphql';

@InputType()
export class CompanyFilter extends BaseFilter {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    mine?: boolean;
}

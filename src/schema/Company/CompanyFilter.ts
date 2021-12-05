import { ConfiguredFilter } from './../Configured/ConfiguredFilter';
import { Field, InputType } from 'type-graphql';

@InputType()
export class CompanyFilter extends ConfiguredFilter {
    @Field({ nullable: true })
    name?: string;
}

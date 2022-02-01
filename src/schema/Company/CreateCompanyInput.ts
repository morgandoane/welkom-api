import { Context } from '@src/auth/context';
import { MinLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Company } from './Company';

@InputType()
export class CreateCompanyInput {
    @MinLength(2)
    @Field()
    name!: string;

    public async validateCompany(context: Context): Promise<Company> {
        return {
            ...context.base,
            name: this.name,
        };
    }
}

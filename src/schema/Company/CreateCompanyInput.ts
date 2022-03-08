import { ContactInput } from './../Contact/ContactInput';
import { Context } from '@src/auth/context';
import { MinLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Company } from './Company';

@InputType()
export class CreateCompanyInput {
    @MinLength(2)
    @Field()
    name!: string;

    @Field(() => [ContactInput])
    contacts!: ContactInput[];

    public async validateCompany(context: Context): Promise<Company> {
        return {
            ...context.base,
            name: this.name,
            contacts: await Promise.all(this.contacts.map((c) => c.validate())),
        };
    }
}

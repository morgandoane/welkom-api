import { CompanyLoader } from './../Company/Company';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { MinLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Organization } from './Organization';
import { Company } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';

@InputType()
export class CreateOrganizationInput {
    @MinLength(2)
    @Field()
    name!: string;

    @MinLength(1)
    @Field(() => [ObjectIdScalar])
    companies!: Ref<Company>[];

    public async validateOrganization(context: Context): Promise<Organization> {
        const companies = await CompanyLoader.loadMany(this.companies, true);
        return {
            ...context.base,
            ...this,
        };
    }
}

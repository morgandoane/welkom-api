import { CompanyLoader } from './../Company/Company';
import { Ref } from '@typegoose/typegoose';
import { MinLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Company } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Organization } from './Organization';

@InputType()
export class UpdateOrganizationInput {
    @Field({ nullable: true })
    deleted?: boolean;

    @Field({ nullable: true })
    name?: string;

    @MinLength(1)
    @Field(() => [ObjectIdScalar], { nullable: true })
    companies?: Ref<Company>[];

    public async serializeOrganizationUpdate(): Promise<Partial<Organization>> {
        const res: Partial<Organization> = {};

        if (this.deleted !== null && this.deleted !== undefined)
            res.deleted = this.deleted;
        if (this.name) res.name = this.name;
        if (this.companies) {
            const companies = await CompanyLoader.loadMany(
                this.companies,
                true
            );
            res.companies = this.companies;
        }

        return res;
    }
}

import { Field, InputType } from 'type-graphql';
import { Company } from './Company';

@InputType()
export class UpdateCompanyInput {
    @Field({ nullable: true })
    name?: string;

    public async serializeCompanyUpdate(): Promise<Partial<Company>> {
        const res: Partial<Company> = {};

        if (this.name) res.name = this.name;

        return res;
    }
}

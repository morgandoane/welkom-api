import { Field, InputType } from 'type-graphql';
import { ContactInput } from '../Contact/ContactInput';
import { Company } from './Company';

@InputType()
export class UpdateCompanyInput {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    deleted?: boolean;

    @Field(() => [ContactInput], { nullable: true })
    contacts?: ContactInput[];

    public async serializeCompanyUpdate(): Promise<Partial<Company>> {
        const res: Partial<Company> = {};

        if (this.name) res.name = this.name;
        if (this.deleted !== null && this.deleted !== undefined)
            res.deleted = this.deleted;

        if (this.contacts) {
            res.contacts = await Promise.all(
                this.contacts.map((c) => c.validate())
            );
        }

        return res;
    }
}

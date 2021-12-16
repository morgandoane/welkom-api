import { Contact } from './Contact';
import { Context } from './../../auth/context';
import { Field, InputType } from 'type-graphql';

@InputType()
export class ContactInput {
    @Field()
    given_name!: string;

    @Field()
    family_name!: string;

    @Field({ nullable: true })
    email_on_order?: boolean;

    @Field({ nullable: true })
    cc_on_order?: boolean;

    @Field({ nullable: true })
    email?: string;

    @Field({ nullable: true })
    phone?: string;

    public serializeContactInput({ base }: Context): Contact {
        return { ...base, ...this };
    }

    public serializeContactUpdate({ base }: Context): Partial<Contact> {
        return {
            ...this,
            date_modified: base.date_modified,
            modified_by: base.modified_by,
        };
    }
}

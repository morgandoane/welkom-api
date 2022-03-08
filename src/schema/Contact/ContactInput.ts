import { getId } from '@src/utils/getId';
import { Field, InputType } from 'type-graphql';
import { Contact } from './Contact';

@InputType()
export class ContactInput {
    @Field()
    name!: string;

    @Field()
    email!: string;

    @Field({ nullable: true })
    title?: string;

    @Field()
    email_on_order!: boolean;

    @Field()
    cc_on_order!: boolean;

    public async validate(): Promise<Contact> {
        return { ...this, ...getId() };
    }
}

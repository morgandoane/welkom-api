import { Field, InputType } from 'type-graphql';
import { Address } from './Address';

@InputType()
export class AddressInput {
    @Field()
    line_1!: string;

    @Field({ nullable: true })
    line_2?: string;

    @Field()
    city!: string;

    @Field()
    state!: string;

    @Field()
    postal!: string;

    @Field()
    country!: string;

    public async validateAddress(): Promise<Address> {
        return this;
    }
}

import { CompanyLoader } from './../Company/Company';
import { AddressInput } from './../Address/AddressInput';
import { Context } from '@src/auth/context';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Company } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Location } from './Location';
import { UserInputError } from 'apollo-server-core';

@InputType()
export class CreateLocationInput {
    @Field(() => ObjectIdScalar)
    company!: Ref<Company>;

    @Field({ nullable: true })
    label?: string;

    @Field(() => AddressInput, { nullable: true })
    address!: AddressInput | null;

    public async validateLocation(context: Context): Promise<Location> {
        if (!this.label && !this.address) {
            throw new UserInputError(
                'Please provide a label or address for location.'
            );
        }
        const { _id: company } = await CompanyLoader.load(this.company, true);
        return {
            ...context.base,
            address: this.address,
            label: this.label || this.address?.city || null,
            company,
        };
    }
}

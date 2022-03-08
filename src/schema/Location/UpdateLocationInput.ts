import { Field, InputType } from 'type-graphql';
import { AddressInput } from '../Address/AddressInput';
import { Location } from './Location';

@InputType()
export class UpdateLocationInput {
    @Field({ nullable: true })
    label?: string;

    @Field({ nullable: true })
    deleted?: boolean;

    @Field(() => AddressInput, { nullable: true })
    address!: AddressInput | null;

    public async serializeLocationUpdate(): Promise<Partial<Location>> {
        const res: Partial<Location> = {};

        if (this.deleted !== undefined && this.deleted !== null)
            res.deleted = this.deleted;
        if (this.label !== undefined) res.label = this.label;
        if (this.address !== undefined) res.address = this.address;

        return res;
    }
}

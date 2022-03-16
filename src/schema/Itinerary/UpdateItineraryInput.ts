import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Company, CompanyLoader } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Order } from '../Order/Order';
import { Itinerary } from './Itinerary';

@InputType()
export class UpdateItineraryInput {
    @Field({ nullable: true })
    deleted: boolean;

    @Field({ nullable: true })
    code: string | null;

    @Field(() => ObjectIdScalar, { nullable: true })
    carrier?: Ref<Company> | null;

    @Field(() => ObjectIdScalar, { nullable: true })
    order_link?: Ref<Order> | null;

    public async serializeItineraryUpdate(): Promise<Partial<Itinerary>> {
        const res: Partial<Itinerary> = {};

        if (this.deleted !== null && this.deleted !== undefined) {
            res.deleted = this.deleted;
        }
        if (this.code !== undefined) res.code = this.code;
        if (this.order_link !== undefined) res.order_link = this.order_link;
        if (this.carrier !== undefined) {
            if (this.carrier == null) res.carrier = null;
            else {
                const carrier = await CompanyLoader.load(this.carrier, true);
                res.carrier = carrier._id;
            }
        }

        return res;
    }
}

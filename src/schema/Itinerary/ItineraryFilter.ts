import { Itinerary } from './Itinerary';
import { Lot } from '../Lot/Lot';
import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType, Ref } from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Order } from '../Order/Order';

@InputType()
export class ItineraryFilter extends UploadEnabledFilter {
    @Field(() => ObjectIdScalar, { nullable: true })
    carrier?: Ref<Company>;

    @Field({ nullable: true })
    code?: string;

    @Field(() => ObjectIdScalar, { nullable: true, defaultValue: null })
    order_link?: Ref<Order> | null;

    public async serializeItineraryFilter(): Promise<
        FilterQuery<DocumentType<Itinerary>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Itinerary>>;

        if (this.carrier !== undefined) query.carrier = this.carrier;
        if (this.order_link !== undefined) query.order_link = this.order_link;
        if (this.code) query.code = { $regex: new RegExp(this.code, 'i') };

        return query;
    }
}

import { Itinerary } from './Itinerary';
import { Lot } from '../Lot/Lot';
import { UploadEnabledFilter } from '../UploadEnabled/UploadEnabledFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';
import { DocumentType, Ref } from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';

@InputType()
export class ItineraryFilter extends UploadEnabledFilter {
    @Field(() => ObjectIdScalar, { nullable: true })
    carrier?: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    commissioned_by?: Ref<Company>;

    @Field({ nullable: true })
    code?: string;

    public async serializeItineraryFilter(): Promise<
        FilterQuery<DocumentType<Itinerary>>
    > {
        const query = {
            ...(await this.serializeUploadEnabledFilter()),
        } as FilterQuery<DocumentType<Itinerary>>;

        if (this.carrier !== undefined) query.vendor = this.carrier;
        if (this.commissioned_by) query.commissioned_by = this.commissioned_by;
        if (this.code) query.code = { $regex: new RegExp(this.code, 'i') };

        return query;
    }
}

import { BaseFilter } from './../../../Base/BaseFilter';
import { BucketLot } from './BucketLot';
import { FilterQuery } from 'mongoose';
import { Field, InputType } from 'type-graphql';

@InputType()
export class BucketLotFilter extends BaseFilter {
    @Field({ nullable: true })
    code?: string;

    serializeBucketLotFilter(): FilterQuery<BucketLot> {
        const query: FilterQuery<BucketLot> = this.serializeBaseFilter();
        if (this.code) query.code = { $regex: new RegExp(this.code, 'i') };

        return query;
    }
}

import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { LotContent } from '../LotContent/LotContent';
import { QualityCheckResponse } from '../QualityCheckResponse/QualityCheckResponse';

@ObjectType()
export class FulfillmentContent extends LotContent {
    @Field()
    @prop({ required: true })
    per_pallet!: number;

    @Field(() => [QualityCheckResponse])
    @prop({ required: true, type: () => QualityCheckResponse })
    quality_check_responses!: QualityCheckResponse[];
}

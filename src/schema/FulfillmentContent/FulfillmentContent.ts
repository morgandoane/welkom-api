import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { LotContent } from '../LotContent/LotContent';
import { PalletConfiguration } from '../PalletConfiguration/PalletConfiguration';
import { QualityCheckResponse } from '../QualityCheckResponse/QualityCheckResponse';

@ObjectType()
export class FulfillmentContent extends LotContent {
    @Field(() => PalletConfiguration)
    @prop({ required: true })
    pallet_configuration!: PalletConfiguration;

    @Field(() => [QualityCheckResponse])
    @prop({ required: true, type: () => QualityCheckResponse })
    quality_check_responses!: QualityCheckResponse[];
}

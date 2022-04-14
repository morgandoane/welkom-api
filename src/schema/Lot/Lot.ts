import { FulfillmentType } from './../Fulfillment/Fulfillment';
import { Base } from './../Base/Base';
import { getBaseLoader } from './../Loader';
import { Item } from '../Item/Item';
import {
    getModelForClass,
    index,
    modelOptions,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Location } from '../Location/Location';
import { Company } from '../Company/Company';
import { Field, ObjectType } from 'type-graphql';
import { LotContent } from '../Content/LotContent';
import { QualityCheckResponse } from '../QualityCheckResponse/QualityCheckResponse';
import { ObjectId } from 'mongoose';

@ObjectType()
@index({ code: 1 })
@modelOptions({
    schemaOptions: {
        collection: 'lots',
    },
})
export class Lot extends Base {
    @Field()
    @prop({ required: true })
    code!: string;

    @Field()
    @prop({ required: true })
    start_quantity!: number;

    @Field(() => FulfillmentType, { nullable: true })
    @prop({ required: false, enum: FulfillmentType })
    fulfillment_type?: FulfillmentType;

    @Field(() => Item)
    @prop({ required: true, ref: () => Item })
    item!: Ref<Item> | ObjectId;

    @Field(() => [QualityCheckResponse])
    @prop({ required: true, type: () => [QualityCheckResponse] })
    quality_check_responses!: QualityCheckResponse[];

    @Field(() => Location, { nullable: true })
    @prop({ required: false, ref: () => Location })
    location?: Ref<Location> | ObjectId;

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    company?: Ref<Company> | ObjectId;

    @Field(() => [LotContent])
    @prop({ required: true, type: () => LotContent })
    contents!: LotContent[];
}

export const LotModel = getModelForClass(Lot);
export const LotLoader = getBaseLoader(LotModel);

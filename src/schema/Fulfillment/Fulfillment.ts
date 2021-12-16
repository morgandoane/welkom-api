import { Base } from './../Base/Base';
import { Bol } from './../Bol/Bol';
import { loaderResult } from './../../utils/loaderResult';
import { LotLoader } from './../Lot/Lot';
import { Company } from './../Company/Company';
import { getBaseLoader } from './../Loader';
import {
    modelOptions,
    prop,
    Ref,
    getModelForClass,
    pre,
    DocumentType,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Location } from '../Location/Location';
import { Lot } from '../Lot/Lot';
import { Item } from '../Item/Item';

export enum FulfillmentType {
    Shipment = 'Shipment',
    Receipt = 'Receipt',
}

@pre<Fulfillment>('save', async function () {
    const theseLots = (await (
        await LotLoader.loadMany(this.lots.map((lot) => lot.toString()))
    ).map((result) => loaderResult(result))) as DocumentType<Lot>[];

    const items = theseLots.map((lot) => lot.item);

    this.items = [...new Set(items)];
})
@modelOptions({
    schemaOptions: {
        collection: 'fulfillments',
    },
})
@ObjectType()
export class Fulfillment extends Base {
    @prop({ required: true, ref: () => Bol })
    bol!: Ref<Bol>;

    @Field(() => FulfillmentType)
    @prop({ required: true, enum: FulfillmentType })
    type!: FulfillmentType;

    @Field(() => [Lot])
    @prop({ required: true, ref: () => Lot })
    lots!: Ref<Lot>[];

    // denormalized
    // set upon save
    @Field(() => [Item])
    @prop({ required: true, ref: () => Item })
    items?: Ref<Item>[];

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    company!: Ref<Company>;

    @Field(() => Location)
    @prop({ required: true, ref: () => Location })
    location!: Ref<Location>;
}

export const FulfillmentModel = getModelForClass(Fulfillment);

export const FulfillmentLoader = getBaseLoader(FulfillmentModel);

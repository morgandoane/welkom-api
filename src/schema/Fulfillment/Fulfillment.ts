import { Verified } from './../Verified/Verified';
import { Bol, BolModel } from './../Bol/Bol';
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
import { ObjectId } from 'mongoose';

export enum FulfillmentType {
    Shipment = 'Shipment',
    Receipt = 'Receipt',
}

@pre<Fulfillment>('save', async function () {
    const theseLots = (await (
        await LotLoader.loadMany(this.lots.map((lot) => lot.toString()))
    ).map((result) => loaderResult(result))) as DocumentType<Lot>[];

    await BolModel.findOneAndUpdate(
        { _id: this.bol.toString() },
        { date_modified: new Date() }
    );

    const items = theseLots.map((lot) => lot.item);

    this.items = [...new Set(items)];
})
@modelOptions({
    schemaOptions: {
        collection: 'fulfillments',
    },
})
@ObjectType()
export class Fulfillment extends Verified {
    @Field(() => Bol)
    @prop({ required: true, ref: 'Bol' })
    bol!: Ref<Bol> | ObjectId;

    @Field(() => FulfillmentType)
    @prop({ required: true, enum: FulfillmentType })
    type!: FulfillmentType;

    @Field(() => [Lot])
    @prop({ required: true, ref: 'Lot' })
    lots!: (Ref<Lot> | ObjectId)[];

    // denormalized
    // set upon save
    @Field(() => [Item])
    @prop({ required: true, ref: () => Item })
    items?: (Ref<Item> | ObjectId)[];

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    company!: Ref<Company> | ObjectId;

    @Field(() => Location)
    @prop({ required: true, ref: () => Location })
    location!: Ref<Location> | ObjectId;
}

export const FulfillmentModel = getModelForClass(Fulfillment);

export const FulfillmentLoader = getBaseLoader(FulfillmentModel);

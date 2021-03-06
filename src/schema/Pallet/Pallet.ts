import { RecipeVersion } from './../RecipeVersion/RecipeVersion';
import { getBaseLoader } from '@src/schema/Loader';
import { BucketLot } from './../Lot/extensions/BucketLot/BucketLot';
import { Base } from '@src/schema/Base/Base';
import {
    modelOptions,
    prop,
    Ref,
    getModelForClass,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Item } from '../Item/Item';
import { Location } from '../Location/Location';
import { ObjectId } from 'mongoose';

@modelOptions({
    schemaOptions: {
        collection: 'pallets',
    },
})
@ObjectType()
export class Pallet extends Base {
    @Field(() => BucketLot)
    @prop({ required: true, ref: () => BucketLot })
    lot!: Ref<BucketLot> | ObjectId;

    // denormalized
    @Field(() => Item)
    @prop({ required: true, ref: () => Item })
    item!: Ref<Item> | ObjectId;

    // denormalized
    @Field(() => Location)
    @prop({ required: true, ref: () => Location })
    location!: Ref<Location> | ObjectId;

    @Field(() => RecipeVersion, { nullable: true })
    @prop({ required: false, ref: () => RecipeVersion })
    recipe_version?: Ref<RecipeVersion> | ObjectId;
}

export const PalletModel = getModelForClass(Pallet);
export const PalletLoader = getBaseLoader(PalletModel);

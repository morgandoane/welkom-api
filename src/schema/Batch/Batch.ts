import { ProductionLine } from './../ProductionLine/ProductionLine';
import { Item } from '@src/schema/Item/Item';
import { Location } from '@src/schema/Location/Location';
import { getBaseLoader } from './../Loader';
import { ProceduralLot } from './../Lot/extensions/ProceduralLot/ProceduralLot';
import { RecipeVersion } from './../RecipeVersion/RecipeVersion';
import { Base } from './../Base/Base';
import {
    modelOptions,
    prop,
    Ref,
    getModelForClass,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { ObjectId } from 'mongoose';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'batches',
    },
})
export class Batch extends Base {
    @Field(() => Date, { nullable: true })
    @prop({ required: false })
    date_completed?: Date;

    @Field(() => RecipeVersion)
    @prop({ required: true, ref: () => RecipeVersion })
    recipe_version!: Ref<RecipeVersion> | ObjectId;

    @Field(() => ProceduralLot)
    @prop({ required: true, ref: () => ProceduralLot })
    lot!: Ref<ProceduralLot> | ObjectId;

    @Field(() => ProductionLine, { nullable: true })
    @prop({ required: false, ref: () => ProductionLine })
    production_line?: Ref<ProductionLine> | ObjectId;

    // denormalized
    @Field(() => Item)
    @prop({ required: true, ref: () => Item })
    item!: Ref<Item> | ObjectId;

    // denormalized
    @Field(() => Location)
    @prop({ required: true, ref: () => Location })
    location!: Ref<Location> | ObjectId;
}

export const BatchModel = getModelForClass(Batch);
export const BatchLoader = getBaseLoader(BatchModel);

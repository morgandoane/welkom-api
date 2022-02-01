import { RecipeVersion } from './../RecipeVersion/RecipeVersion';
import { ProductionLine } from './../ProductionLine/ProductionLine';
import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import {
    modelOptions,
    getModelForClass,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { getBaseLoader } from '@src/utils/baseLoader';
import { differenceInMinutes } from 'date-fns';
import { Location } from '../Location/Location';
import { BatchLot } from '../BatchLot/BatchLot';
import { Company } from '../Company/Company';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'batches',
    },
})
export class Batch extends UploadEnabled {
    @Field(() => RecipeVersion, { nullable: true })
    @prop({ required: false, ref: () => RecipeVersion })
    recipe_version!: Ref<RecipeVersion> | null;

    @Field(() => BatchLot)
    @prop({ required: true, ref: () => BatchLot })
    lot!: Ref<BatchLot>;

    @Field(() => Location)
    @prop({ required: true, ref: () => Location })
    location!: Ref<Location>;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    company!: Ref<Company>;

    @Field(() => ProductionLine, { nullable: true })
    @prop({ required: false, ref: () => ProductionLine })
    production_line!: Ref<ProductionLine> | null;

    @Field({ nullable: true })
    @prop({ required: false })
    date_completed!: Date | null;
}

export const BatchModel = getModelForClass(Batch);
export const BatchLoader = getBaseLoader(BatchModel);

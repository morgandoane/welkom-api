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
    recipe_version!: Ref<RecipeVersion>;

    @Field(() => ProceduralLot)
    @prop({ required: true, ref: () => ProceduralLot })
    lot!: Ref<ProceduralLot>;
}

export const BatchModel = getModelForClass(Batch);
export const BatchLoader = getBaseLoader(BatchModel);

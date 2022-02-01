import {
    modelOptions,
    getModelForClass,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Base } from '@src/schema/Base/Base';
import { getBaseLoader } from '@src/utils/baseLoader';
import { RecipeSection } from '../RecipeSection/RecipeSection';
import { Recipe } from '../Recipe/Recipe';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'recipeversions',
    },
})
export class RecipeVersion extends Base {
    @Field(() => Recipe)
    @prop({ required: true, ref: () => Recipe })
    recipe!: Ref<Recipe>;

    @Field(() => [RecipeSection])
    @prop({ required: true, type: () => RecipeSection })
    sections!: RecipeSection[];

    @Field(() => [String])
    @prop({ required: true, type: () => String })
    parameters!: string[];
}

export const RecipeVersionModel = getModelForClass(RecipeVersion);
export const RecipeVersionLoader = getBaseLoader(RecipeVersionModel);

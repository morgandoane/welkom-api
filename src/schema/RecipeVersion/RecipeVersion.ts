import { Recipe } from './../Recipe/Recipe';
import { RecipeSection } from './../RecipeStep/RecipeStep';
import { getBaseLoader } from './../Loader';
import { Base } from './../Base/Base';
import { Field, ObjectType } from 'type-graphql';
import {
    modelOptions,
    getModelForClass,
    prop,
    Ref,
} from '@typegoose/typegoose';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'recipeVersions',
    },
})
export class RecipeVersion extends Base {
    @Field(() => Recipe)
    @prop({ required: true, ref: 'Recipe' })
    recipe!: Ref<Recipe>;

    @Field(() => [RecipeSection])
    @prop({ required: true, type: () => RecipeSection })
    sections!: RecipeSection[];

    @Field(() => [String])
    @prop({ required: true, type: () => String })
    parameters!: string[];

    @Field()
    @prop({ required: true })
    base_units_produced!: number;

    @Field({ nullable: true })
    @prop({ required: false })
    note?: string;
}

export const RecipeVersionModel = getModelForClass(RecipeVersion);
export const RecipeVersionLoader = getBaseLoader(RecipeVersionModel);

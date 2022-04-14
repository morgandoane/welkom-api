import { Recipe } from './../Recipe/Recipe';
import { RecipeVersion } from './../RecipeVersion/RecipeVersion';
import { mongoose, prop, Ref } from '@typegoose/typegoose';
import { Field, ID, ObjectType } from 'type-graphql';
import { ObjectId } from 'mongoose';

@ObjectType()
export class MixingCardLine {
    @Field(() => ID)
    @prop({ required: true })
    _id!: mongoose.Types.ObjectId;

    @Field(() => Recipe)
    @prop({ ref: () => Recipe, required: true })
    recipe!: Ref<Recipe> | ObjectId;

    @Field(() => RecipeVersion, { nullable: true })
    @prop({ ref: () => RecipeVersion, required: false })
    recipe_version?: Ref<RecipeVersion> | ObjectId;

    @Field({ nullable: true })
    @prop({ required: false })
    limit?: number;
}

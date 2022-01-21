import { ItemContent, ItemPluralContent } from './../Content/Content';
import { mongoose, prop } from '@typegoose/typegoose';
import { Field, ObjectType, ID } from 'type-graphql';

@ObjectType()
export class RecipeSection {
    @Field(() => ID)
    @prop({ required: true, type: mongoose.Types.ObjectId })
    _id: mongoose.Types.ObjectId;

    @Field({ nullable: true })
    @prop({ required: false })
    label?: string;

    @Field(() => [RecipeStep])
    @prop({ required: true, type: () => RecipeStep })
    steps!: RecipeStep[];
}

@ObjectType()
export class RecipeStep {
    @Field(() => ID)
    @prop({ required: true, type: mongoose.Types.ObjectId })
    _id: mongoose.Types.ObjectId;

    @Field({ nullable: true })
    @prop({ required: false })
    instruction?: string;

    @Field(() => ItemPluralContent, { nullable: true })
    @prop({ required: false })
    content?: ItemPluralContent;
}

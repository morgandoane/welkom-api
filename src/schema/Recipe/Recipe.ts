import { getBaseLoader } from './../Loader';
import {
    prop,
    Ref,
    getModelForClass,
    modelOptions,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Base } from '../Base/Base';
import { Folder } from '../Folder/Folder';
import { Item } from '../Item/Item';

@modelOptions({
    schemaOptions: {
        collection: 'recipes',
    },
})
@ObjectType()
export class Recipe extends Base {
    @Field()
    @prop({ required: true })
    name!: string;

    @Field(() => Item)
    @prop({ required: true, ref: () => Item })
    item!: Ref<Item>;

    @Field(() => Folder, { nullable: true })
    @prop({ required: false, ref: () => Folder })
    folder?: Ref<Folder>;
}

export const RecipeModel = getModelForClass(Recipe);
export const RecipeLoader = getBaseLoader(RecipeModel);

import { getBaseLoader } from './../../utils/baseLoader';
import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import {
    modelOptions,
    prop,
    getModelForClass,
    Ref,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Folder } from '../Folder/Folder';
import { Item } from '../Item/Item';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'recipes',
    },
})
export class Recipe extends UploadEnabled {
    @Field()
    @prop({ required: true })
    name!: string;

    @Field(() => Item)
    @prop({ required: true, ref: () => Item })
    item!: Ref<Item>;

    @Field(() => Folder, { nullable: true })
    @prop({ required: false, ref: () => Folder })
    folder!: Ref<Folder> | null;
}

export const RecipeModel = getModelForClass(Recipe);
export const RecipeLoader = getBaseLoader(RecipeModel);

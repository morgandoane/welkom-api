import { MoveFolderResult } from './MoveFolderResult';
import { RecipeFolder } from './extensions/RecipeFolder/RecipeFolder';
import { getBaseLoader } from './../Loader';
import {
    prop,
    Ref,
    getModelForClass,
    modelOptions,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Base } from '../Base/Base';

export enum FolderClass {
    Recipe = 'Recipe',
}

@modelOptions({
    schemaOptions: {
        collection: 'folders',
    },
})
@ObjectType()
export class Folder extends Base {
    @Field(() => FolderClass)
    @prop({ required: true, enum: FolderClass })
    class!: FolderClass;

    @Field()
    @prop({ required: true })
    name!: string;

    @Field(() => Folder, { nullable: true })
    @prop({ required: false, ref: () => Folder })
    parent?: Ref<Folder>;

    @Field(() => [Folder])
    folders?: Folder[];
}

export const FolderModel = getModelForClass(Folder);
export const FolderLoader = getBaseLoader(FolderModel);

import { getBaseLoader } from './../../../Loader';
import { getModelForClass } from '@typegoose/typegoose';
import { Recipe } from './../../../Recipe/Recipe';
import { Folder } from './../../Folder';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class RecipeFolder extends Folder {
    @Field(() => [Recipe])
    recipes?: Recipe[];
}

export const RecipeFolderModel = getModelForClass(RecipeFolder);
export const RecipeFolderLoader = getBaseLoader(RecipeFolderModel);

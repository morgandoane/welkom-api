import { getBaseLoader } from './../../../Loader';
import { getModelForClass } from '@typegoose/typegoose';
import { Recipe } from './../../../Recipe/Recipe';
import { Folder, FolderClass } from './../../Folder';
import { Field, ObjectType } from 'type-graphql';
import { Context } from '@src/auth/context';

@ObjectType()
export class RecipeFolder extends Folder {
    @Field(() => [Recipe])
    recipes?: Recipe[];

    public static fromNull(context: Context): RecipeFolder {
        const folder: RecipeFolder = {
            ...context.base,
            name: 'Home',
            class: FolderClass.Recipe,
        };

        return folder;
    }
}

export const RecipeFolderModel = getModelForClass(RecipeFolder);
export const RecipeFolderLoader = getBaseLoader(RecipeFolderModel);

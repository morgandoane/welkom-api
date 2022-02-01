import { getBaseLoader } from '@src/utils/baseLoader';
import { Base } from '@src/schema/Base/Base';
import {
    modelOptions,
    prop,
    Ref,
    getModelForClass,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Context } from '@src/auth/context';

export enum FolderClass {
    Recipe = 'Recipe',
}

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'folders',
    },
})
export class Folder extends Base {
    @Field(() => FolderClass)
    @prop({ required: true, enum: FolderClass })
    class!: FolderClass;

    @Field()
    @prop({ required: true })
    name!: string;

    @Field(() => Folder)
    @prop({ required: true, ref: () => Folder })
    parent!: Ref<Folder> | null;

    public static fromNull(
        context: Context,
        folder_class: FolderClass
    ): Folder {
        return {
            ...context.base,
            class: folder_class,
            name: 'Home',
            parent: null,
        };
    }
}

export const FolderModel = getModelForClass(Folder);
export const FolderLoader = getBaseLoader(FolderModel);

import { RecipeVersion } from './../RecipeVersion/RecipeVersion';
import { DateGroup } from './../DateGroup/DateGroup';
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
import { ObjectId } from 'mongoose';

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
    item!: Ref<Item> | ObjectId;

    @Field(() => Folder, { nullable: true })
    @prop({ required: false, ref: () => Folder })
    folder?: Ref<Folder> | ObjectId;

    @Field(() => [DateGroup])
    version_date_groups?: DateGroup[];

    @Field(() => RecipeVersion, { nullable: true })
    active?: RecipeVersion;
}

export const RecipeModel = getModelForClass(Recipe);
export const RecipeLoader = getBaseLoader(RecipeModel);

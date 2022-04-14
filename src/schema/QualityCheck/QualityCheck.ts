import { getBaseLoader } from './../Loader';
import { Prompt } from './../Prompt/Prompt';
import {
    modelOptions,
    prop,
    Ref,
    getModelForClass,
} from '@typegoose/typegoose';
import { Base } from '@src/schema/Base/Base';
import { Field, ObjectType } from 'type-graphql';
import { Item } from '../Item/Item';
import { ObjectId } from 'mongoose';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'qualityChecks',
    },
})
export class QualityCheck extends Base {
    @Field(() => Item)
    @prop({ required: true, ref: () => Item })
    item!: Ref<Item> | ObjectId;

    @Field(() => Prompt)
    @prop({ required: true })
    prompt!: Prompt;
}

export const QualityCheckModel = getModelForClass(QualityCheck);

export const QualityCheckLoader = getBaseLoader(QualityCheckModel);

import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import { getBaseLoader } from '@src/utils/baseLoader';
import {
    modelOptions,
    getModelForClass,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

export enum DesignLocation {
    'Draper' = 'Draper',
    'WestJordan' = 'WestJordan',
    'Misc' = 'Misc',
}

export enum DesignCategory {
    'Conveyor' = 'Conveyor',
    'Sprial' = 'Sprial',
    'Oven' = 'Oven',
    'Packing' = 'Packing',
}

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'designs',
    },
})
export class Design extends UploadEnabled {
    @Field(() => [Design])
    ancestry?: Design[];

    @Field()
    @prop({ required: true })
    part_number!: string;

    @Field(() => DesignLocation)
    @prop({ required: true, enum: DesignLocation })
    location!: DesignLocation;

    @Field(() => DesignCategory)
    @prop({ required: true, enum: DesignCategory })
    category!: DesignCategory;

    @Field(() => Design, { nullable: true })
    @prop({ required: false, ref: () => Design })
    parent?: Ref<Design> | null;

    @Field({ nullable: true })
    @prop({ required: false })
    description?: string | null;
}

export const DesignModel = getModelForClass(Design);

export const DesignLoader = getBaseLoader(DesignModel);

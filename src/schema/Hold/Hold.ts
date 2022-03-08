import { HoldResolution } from '../HoldResolution/HoldResolution';
import { getBaseLoader } from '@src/utils/baseLoader';
import { UploadEnabled } from '../UploadEnabled/UploadEnabled';
import {
    modelOptions,
    getModelForClass,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Lot } from '../Lot/Lot';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'holds',
    },
})
export class Hold extends UploadEnabled {
    @Field()
    @prop({ required: true })
    reason!: string;

    @Field()
    @prop({ required: true })
    propagating!: boolean;

    @Field(() => [Lot])
    @prop({ required: true, ref: () => Lot })
    lots!: Ref<Lot>[];

    @Field(() => HoldResolution, { nullable: true })
    @prop({ required: false })
    resolution!: HoldResolution | null;
}

export const HoldModel = getModelForClass(Hold);
export const HoldLoader = getBaseLoader(HoldModel);

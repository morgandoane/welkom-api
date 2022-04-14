import { QualityCheck } from './../QualityCheck/QualityCheck';
import { Field, ObjectType } from 'type-graphql';
import { prop, Ref } from '@typegoose/typegoose';
import { ObjectId } from 'mongoose';

@ObjectType()
export class QualityCheckResponse {
    @Field(() => QualityCheck)
    @prop({ required: true, ref: () => QualityCheck })
    qualityCheck!: Ref<QualityCheck> | ObjectId;

    @Field()
    @prop({ required: true })
    response!: string;

    // set upon save
    @Field()
    @prop({ required: true })
    passed!: boolean;
}

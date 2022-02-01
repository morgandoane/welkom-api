import { prop, Ref } from '@typegoose/typegoose';
import { Identified } from './../Base/Base';
import { Field, ObjectType } from 'type-graphql';
import { QualityCheck } from '../QualityCheck/QualityCheck';

@ObjectType()
export class QualityCheckResponse extends Identified {
    @Field(() => QualityCheck)
    @prop({ required: true, ref: () => QualityCheck })
    quality_check!: Ref<QualityCheck>;

    @Field({ nullable: true })
    @prop({ required: false })
    response!: string | null;

    @Field()
    @prop({ required: true })
    passed!: boolean;
}

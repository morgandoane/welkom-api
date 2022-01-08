import { getBaseLoader } from './../Loader';
import { Base } from './../Base/Base';
import { modelOptions, getModelForClass, prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

export enum VerificationStatus {
    Verified = 'Verified',
    Warning = 'Warning',
    Problem = 'Problem',
}

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'verifications',
    },
})
export class Verification extends Base {
    @Field(() => VerificationStatus)
    @prop({ required: true, enum: VerificationStatus })
    status!: VerificationStatus;

    @Field({ nullable: true })
    @prop({ required: false })
    notes?: string;
}

export const VerificationModel = getModelForClass(Verification);

export const VerificationLoader = getBaseLoader(VerificationModel);

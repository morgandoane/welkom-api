import { ObjectIdScalar } from '@src/schema/ObjectIdScalar/ObjectIdScalar';
import { UploadEnabled } from './../UploadEnabled/UploadEnabled';
import { BolContent } from '../BolContent/BolContent';
import { prop, Ref } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Location } from '../Location/Location';

@ObjectType()
export class OrderAppointment extends UploadEnabled {
    @Field(() => [BolContent])
    @prop({ required: true, type: () => BolContent })
    contents!: BolContent[];

    @Field()
    @prop({ required: true })
    date!: Date;

    @Field(() => Location)
    @prop({ required: true, ref: () => Location })
    location!: Ref<Location>;

    @Field({ nullable: true })
    @prop({ required: false })
    time!: number | null;
}

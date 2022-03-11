import { Identified } from '../Base/Base';
import { Field, ObjectType } from 'type-graphql';
import { prop, Ref } from '@typegoose/typegoose';
import { Company } from '../Company/Company';
import { Location } from '../Location/Location';

@ObjectType()
export class Appointment extends Identified {
    @Field()
    @prop({ required: true })
    date!: Date;

    @Field({ nullable: true })
    @prop({ required: false })
    time!: number | null;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    company!: Ref<Company>;

    @Field(() => Location, { nullable: true })
    @prop({ required: false, ref: () => Location })
    location!: Ref<Location> | null;
}

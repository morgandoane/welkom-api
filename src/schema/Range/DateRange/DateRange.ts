import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class DateRange {
    @Field()
    @prop({ required: true })
    start!: Date;

    @Field()
    @prop({ required: true })
    end!: Date;
}

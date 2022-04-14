import { prop } from '@typegoose/typegoose';
import { ObjectType, Field } from 'type-graphql';
import { ItemContent } from './ItemContent';

@ObjectType()
export class BolItemContent extends ItemContent {
    // set upon save
    @Field()
    @prop({ required: true })
    fulfillment_percentage: number;
}

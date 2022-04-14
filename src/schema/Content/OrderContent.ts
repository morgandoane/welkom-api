import { prop, Ref } from '@typegoose/typegoose';
import { ObjectId } from 'mongoose';
import { ObjectType, Field } from 'type-graphql';
import { ItemContent } from './ItemContent';
import { Location } from '../Location/Location';

@ObjectType()
export class OrderContent extends ItemContent {
    @Field(() => Location)
    @prop({ required: true, ref: () => Location })
    location!: Ref<Location> | ObjectId;

    @Field(() => Date)
    @prop({ required: true })
    due!: Date;
}

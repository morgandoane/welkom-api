import { prop, Ref } from '@typegoose/typegoose';
import { ObjectId } from 'mongoose';
import { ObjectType, Field } from 'type-graphql';
import { Item } from '../Item/Item';
import { Content } from './Content';

@ObjectType()
export class ItemPluralContent extends Content {
    @Field(() => [Item])
    @prop({ required: true, ref: () => Item })
    items!: (Ref<Item> | ObjectId)[];
}

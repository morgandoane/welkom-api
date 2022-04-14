import { prop } from '@typegoose/typegoose';
import { ObjectId } from 'mongoose';
import { ObjectType } from 'type-graphql';
import { Content } from './Content';

@ObjectType()
export class LotContent extends Content {
    @prop({ required: true })
    lot!: ObjectId;
}

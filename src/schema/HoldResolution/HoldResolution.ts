import { Base } from '@src/schema/Base/Base';
import { Field, ObjectType } from 'type-graphql';
import { prop } from '@typegoose/typegoose';

@ObjectType()
export class HoldResolution extends Base {
    @Field()
    @prop({ required: true })
    action!: string;
}

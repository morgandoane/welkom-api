import { UnitClass } from '@src/schema/Unit/Unit';
import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Base } from '../Base/Base';

@ObjectType()
export class Conversion extends Base {
    @Field(() => UnitClass)
    @prop({ required: true })
    from!: UnitClass;

    @Field(() => UnitClass)
    @prop({ required: true })
    to!: UnitClass;

    @Field()
    @prop({ required: true })
    from_per_to!: number;
}

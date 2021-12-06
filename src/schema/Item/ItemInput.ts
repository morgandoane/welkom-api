import { ObjectIdScalar } from './../ObjectIdScalar';
import { ConfiguredInput } from './../Configured/ConfiguredInput';
import { Field, InputType } from 'type-graphql';
import { ObjectId } from 'mongoose';
import { UnitClass } from '../Unit/Unit';

@InputType()
export class CreateItemInput extends ConfiguredInput {
    @Field(() => ObjectIdScalar)
    item_class!: ObjectId;

    @Field(() => UnitClass)
    unit_class!: UnitClass;

    @Field()
    english!: string;

    @Field()
    spanish!: string;
}

@InputType()
export class UpdateItemInpiut extends ConfiguredInput {
    @Field({ nullable: true })
    english?: string;

    @Field({ nullable: true })
    spanish?: string;

    @Field({ nullable: true })
    deleted?: boolean;
}

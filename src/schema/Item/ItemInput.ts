import { ConfiguredInput } from './../Configured/ConfiguredInput';
import { Field, InputType } from 'type-graphql';
import { UnitClass } from '../Unit/Unit';

@InputType()
export class CreateItemInput extends ConfiguredInput {
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

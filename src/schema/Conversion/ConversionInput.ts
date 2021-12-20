import { Field, InputType } from 'type-graphql';
import { UnitClass } from '../Unit/Unit';

@InputType()
export class ConversionInput {
    @Field(() => UnitClass)
    from!: UnitClass;

    @Field(() => UnitClass)
    to!: UnitClass;

    @Field()
    from_per_to!: number;
}

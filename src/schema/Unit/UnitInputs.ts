import { Field, InputType } from 'type-graphql';
import { UnitClass } from './Unit';

@InputType()
export class CreateUnitInput {
    @Field(() => UnitClass)
    class!: UnitClass;

    @Field()
    english!: string;

    @Field()
    base_per_unit!: number;

    @Field({ nullable: true })
    spanish?: string;

    @Field({ nullable: true })
    english_plural?: string;

    @Field({ nullable: true })
    spanish_plural?: string;
}

@InputType()
export class UpdateUnitInput {
    @Field(() => UnitClass, { nullable: true })
    class?: UnitClass;

    @Field({ nullable: true })
    english?: string;

    @Field({ nullable: true })
    spanish?: string;

    @Field({ nullable: true })
    english_plural?: string;

    @Field({ nullable: true })
    spanish_plural?: string;

    @Field({ nullable: true })
    deleted?: boolean;

    @Field({ nullable: true })
    base_per_unit?: number;
}

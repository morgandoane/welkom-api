import { NamesPluralInput } from './../Names/NamesInput';
import { Context } from '@src/auth/context';
import { Min, MinLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Unit } from './Unit';
import { UnitClass } from './UnitClass';

@InputType()
export class CreateUnitInput {
    @Field(() => NamesPluralInput)
    names!: NamesPluralInput;

    @Field(() => UnitClass)
    unit_class!: UnitClass;

    @Min(0)
    @Field()
    to_base_unit!: number;

    public async validateUnit(context: Context): Promise<Unit> {
        return {
            ...context.base,
            names: this.names,
            unit_class: this.unit_class,
            to_base_unit: this.to_base_unit,
        };
    }
}

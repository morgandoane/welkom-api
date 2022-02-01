import { Min } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { NamesPluralInput } from '../Names/NamesInput';
import { Unit } from './Unit';
import { UnitClass } from './UnitClass';

@InputType()
export class UpdateUnitInput {
    @Field({ nullable: true })
    deleted?: boolean;

    @Field(() => NamesPluralInput, { nullable: true })
    names?: NamesPluralInput;

    @Field(() => UnitClass, { nullable: true })
    unit_class?: UnitClass;

    @Min(0)
    @Field({ nullable: true })
    to_base_unit?: number;

    public async serializeUnitUpdate(): Promise<Partial<Unit>> {
        const res: Partial<Unit> = {};

        if (this.deleted !== undefined && this.deleted !== null)
            res.deleted = this.deleted;
        if (this.names) res.names = this.names;
        if (this.unit_class) res.unit_class = this.unit_class;
        if (this.to_base_unit) res.to_base_unit = this.to_base_unit;

        return res;
    }
}

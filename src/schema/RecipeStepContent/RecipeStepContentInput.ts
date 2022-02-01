import { UnitLoader } from './../Unit/Unit';
import { ItemLoader } from '@src/schema/Item/Item';
import { Field, InputType } from 'type-graphql';
import { Item } from '../Item/Item';
import { Ref } from '@typegoose/typegoose';
import { Unit } from '../Unit/Unit';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { RecipeStepContent } from './RecipeStepContent';
import { getId } from '@src/utils/getId';
import { UserInputError } from 'apollo-server-core';
import { MinLength } from 'class-validator';
import { UnitClass } from '../Unit/UnitClass';
import { BaseUnit } from '../Unit/BaseUnit';

@InputType()
export class RecipeStepContentInput {
    @MinLength(1)
    @Field(() => [ObjectIdScalar])
    items!: Ref<Item>[];

    @Field()
    client_quantity!: number;

    @Field(() => ObjectIdScalar)
    client_unit!: Ref<Unit>;

    public async validateRecipeStepContent(): Promise<RecipeStepContent> {
        const items = await ItemLoader.loadMany(this.items, true);
        const unit = await UnitLoader.load(this.client_unit, true);

        const itemBaseTypes = [...new Set(items.map((item) => item.base_unit))];

        if (itemBaseTypes.length > 1)
            throw new UserInputError(
                'Only one type of BaseUnit per recipe step is allowed.'
            );

        const baseUnit = items[0].base_unit;

        if (
            (unit.unit_class == UnitClass.Count &&
                baseUnit !== BaseUnit.Count) ||
            (unit.unit_class !== UnitClass.Count && baseUnit === BaseUnit.Count)
        ) {
            throw new UserInputError(
                'Count based units cannot be used for weight based inventory.'
            );
        }

        const res: RecipeStepContent = {
            ...getId(),
            ...this,
            quantity:
                this.client_quantity *
                unit.to_base_unit *
                (items.reduce((stack, item) => {
                    return stack + item.per_base_unit;
                }, 0) |
                    items.length),
        };

        return res;
    }
}

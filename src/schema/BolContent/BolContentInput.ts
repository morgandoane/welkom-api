import { UnitLoader } from './../Unit/Unit';
import { ItemLoader } from './../Item/Item';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Item } from '../Item/Item';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Unit } from '../Unit/Unit';
import { BolContent } from './BolContent';
import { UserInputError } from 'apollo-server-errors';
import { BaseUnit } from '../Unit/BaseUnit';
import { UnitClass } from '../Unit/UnitClass';

@InputType()
export class BolContentInput {
    @Field(() => ObjectIdScalar)
    item!: Ref<Item>;

    @Field()
    client_quantity!: number;

    @Field(() => ObjectIdScalar)
    client_unit!: Ref<Unit>;

    @Field({ nullable: true })
    per_pallet!: number | null;

    public async validateBolContentInput(): Promise<BolContent> {
        const {
            _id: item,
            base_unit: item_base_unit,
            per_base_unit,
        } = await ItemLoader.load(this.item, true);

        const {
            _id: client_unit,
            unit_class,
            to_base_unit,
        } = await UnitLoader.load(this.client_unit, true);

        let quantity;

        switch (unit_class) {
            case UnitClass.Count: {
                if (item_base_unit !== BaseUnit.Count) {
                    throw new UserInputError(
                        `Item with id ${item.toString()} must use a Count based unit.`
                    );
                }

                quantity = this.client_quantity * to_base_unit;
                break;
            }
            case UnitClass.Weight: {
                if (item_base_unit === BaseUnit.Count) {
                    throw new UserInputError(
                        `Item with id ${item.toString()} cannot use a Count based unit.`
                    );
                }
                quantity = this.client_quantity * to_base_unit;
                break;
            }
            case UnitClass.Volume: {
                if (item_base_unit === BaseUnit.Count) {
                    throw new UserInputError(
                        `Item with id ${item.toString()} cannot use a Count based unit.`
                    );
                }
                quantity = this.client_quantity * to_base_unit * per_base_unit;
                break;
            }
        }

        const content: BolContent = {
            item,
            client_unit,
            client_quantity: this.client_quantity,
            quantity,
        };

        return content;
    }
}

import { Context } from './../../auth/context';
import { PalletConfigurationInput } from './../PalletConfiguration/PalletConfigurationInput';
import { NamesInput } from './../Names/NamesInput';
import { Min, MinLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { BaseUnit } from '../Unit/BaseUnit';
import { Item } from './Item';

@InputType()
export class CreateItemInput {
    @Field(() => NamesInput)
    names!: NamesInput;

    @Field(() => BaseUnit)
    base_unit!: BaseUnit;

    // Count = 1;
    // Weight = 1;
    // Volume = X Gallons / 1 Pound
    @Min(0)
    @Field()
    per_base_unit!: number;

    @MinLength(1)
    @Field(() => [PalletConfigurationInput])
    pallet_configurations!: PalletConfigurationInput[];

    public async validateItem(context: Context): Promise<Item> {
        const item: Item = { ...context.base, ...this };
        return item;
    }
}

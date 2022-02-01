import { Ingredient } from '../Ingredient/Ingredient';
import { CreateItemInput } from '../../CreateItemInput';
import { InputType } from 'type-graphql';
import { Context } from '@src/auth/context';
import { BaseUnit } from '@src/schema/Unit/BaseUnit';
import { UserInputError } from 'apollo-server-core';

@InputType()
export class CreateIngredientInput extends CreateItemInput {
    public async validateIngredient(context: Context): Promise<Ingredient> {
        if (this.base_unit !== BaseUnit.Pounds)
            throw new UserInputError('Ingredients must be measured in Pounds.');
        const item: Ingredient = { ...context.base, ...this };
        return item;
    }
}

import { Ingredient } from './Ingredient';
import { ItemFilter } from '../../ItemFilter';
import { InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';

@InputType()
export class IngredientFilter extends ItemFilter {
    public async serializeIngredientFilter(): Promise<FilterQuery<Ingredient>> {
        const res: FilterQuery<Ingredient> = {
            ...(await this.serializeItemFilter()),
        };

        return res;
    }
}

import { Product } from './Product';
import { ItemFilter } from '../../ItemFilter';
import { InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';

@InputType()
export class ProductFilter extends ItemFilter {
    public async serializeProductFilter(): Promise<FilterQuery<Product>> {
        const res: FilterQuery<Product> = {
            ...(await this.serializeItemFilter()),
        };

        return res;
    }
}

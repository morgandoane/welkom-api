import { Product } from './Product';
import { ItemFilter } from '../../ItemFilter';
import { Field, InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';

@InputType()
export class ProductFilter extends ItemFilter {
    @Field({ nullable: true })
    upc?: string;

    public async serializeProductFilter(): Promise<FilterQuery<Product>> {
        const res: FilterQuery<Product> = {
            ...(await this.serializeItemFilter()),
        };

        if (this.upc) res.upc = { $regex: new RegExp(this.upc, 'i') };

        return res;
    }
}

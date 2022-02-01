import { Packaging } from './Packaging';
import { ItemFilter } from '../../ItemFilter';
import { InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';

@InputType()
export class PackagingFilter extends ItemFilter {
    public async serializePackagingFilter(): Promise<FilterQuery<Packaging>> {
        const res: FilterQuery<Packaging> = {
            ...(await this.serializeItemFilter()),
        };

        return res;
    }
}

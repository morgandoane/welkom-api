import { MiscItem } from './MiscItem';
import { ItemFilter } from '../../ItemFilter';
import { InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';

@InputType()
export class MiscItemFilter extends ItemFilter {
    public async serializeMiscItemFilter(): Promise<FilterQuery<MiscItem>> {
        const res: FilterQuery<MiscItem> = {
            ...(await this.serializeItemFilter()),
        };

        return res;
    }
}

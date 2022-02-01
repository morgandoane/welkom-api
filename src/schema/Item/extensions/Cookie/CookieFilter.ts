import { Cookie } from './Cookie';
import { ItemFilter } from './../../ItemFilter';
import { InputType } from 'type-graphql';
import { FilterQuery } from 'mongoose';

@InputType()
export class CookieFilter extends ItemFilter {
    public async serializeCookieFilter(): Promise<FilterQuery<Cookie>> {
        const res: FilterQuery<Cookie> = {
            ...(await this.serializeItemFilter()),
        };

        return res;
    }
}

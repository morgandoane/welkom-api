import { Cookie } from './Cookie';
import { InputType } from 'type-graphql';
import { UpdateItemInput } from '../../UpdateItemInput';

@InputType()
export class UpdateCookieInput extends UpdateItemInput {
    public async serializeCookieUpdate(): Promise<Partial<Cookie>> {
        const res: Partial<Cookie> = { ...(await this.serializeItem()) };

        return res;
    }
}

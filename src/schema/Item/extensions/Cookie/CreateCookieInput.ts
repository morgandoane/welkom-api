import { Cookie } from './Cookie';
import { CreateItemInput } from '../../CreateItemInput';
import { InputType } from 'type-graphql';
import { Context } from '@src/auth/context';
import { BaseUnit } from '@src/schema/Unit/BaseUnit';
import { UserInputError } from 'apollo-server-core';

@InputType()
export class CreateCookieInput extends CreateItemInput {
    public async validateCookie(context: Context): Promise<Cookie> {
        if (this.base_unit !== BaseUnit.Pounds)
            throw new UserInputError('Cookies must be measured in Pounds.');
        const item: Cookie = { ...context.base, ...this };
        return item;
    }
}

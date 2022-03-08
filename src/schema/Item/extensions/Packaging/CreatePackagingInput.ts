import { Packaging } from './Packaging';
import { CreateItemInput } from '../../CreateItemInput';
import { InputType } from 'type-graphql';
import { Context } from '@src/auth/context';
import { BaseUnit } from '@src/schema/Unit/BaseUnit';
import { UserInputError } from 'apollo-server-core';

@InputType()
export class CreatePackagingInput extends CreateItemInput {
    public async validatePackaging(context: Context): Promise<Packaging> {
        if (this.base_unit !== BaseUnit.Count)
            throw new UserInputError('Packagings must be measured in Count.');
        const item: Packaging = { ...context.base, ...this };
        return item;
    }
}

import { CreateItemInput } from '../../CreateItemInput';
import { InputType } from 'type-graphql';
import { Context } from '@src/auth/context';
import { BaseUnit } from '@src/schema/Unit/BaseUnit';
import { UserInputError } from 'apollo-server-core';
import { MiscItem } from './MiscItem';

@InputType()
export class CreateMiscItemInput extends CreateItemInput {
    public async validateMiscItem(context: Context): Promise<MiscItem> {
        if (this.base_unit !== BaseUnit.Pounds)
            throw new UserInputError('MiscItems must be measured in Pounds.');
        const item: MiscItem = { ...context.base, ...this };
        return item;
    }
}

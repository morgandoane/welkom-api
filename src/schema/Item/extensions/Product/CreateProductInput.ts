import { prop, Ref } from '@typegoose/typegoose';
import { Product } from './Product';
import { CreateItemInput } from '../../CreateItemInput';
import { Field, InputType } from 'type-graphql';
import { Context } from '@src/auth/context';
import { BaseUnit } from '@src/schema/Unit/BaseUnit';
import { UserInputError } from 'apollo-server-core';
import { Company } from '@src/schema/Company/Company';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar/ObjectIdScalar';

@InputType()
export class CreateProductInput extends CreateItemInput {
    @Field()
    upc!: string;

    @Field(() => ObjectIdScalar)
    company!: Ref<Company>;

    public async validateProduct(context: Context): Promise<Product> {
        if (this.base_unit !== BaseUnit.Count)
            throw new UserInputError('Products must be measured in Count.');
        const item: Product = { ...context.base, ...this };
        return item;
    }
}

import { Product } from './Product';
import { Field, InputType } from 'type-graphql';
import { UpdateItemInput } from '../../UpdateItemInput';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar/ObjectIdScalar';
import { Company } from '@src/schema/Company/Company';
import { Ref } from '@typegoose/typegoose';

@InputType()
export class UpdateProductInput extends UpdateItemInput {
    @Field({ nullable: true })
    upc?: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    company?: Ref<Company>;

    public async serializeProductUpdate(): Promise<Partial<Product>> {
        const res: Partial<Product> = { ...(await this.serializeItem()) };

        if (this.upc) res.upc = this.upc;
        if (this.company) res.company = this.company;

        return res;
    }
}

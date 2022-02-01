import { Context } from '@src/auth/context';
import { Ref } from '@typegoose/typegoose';
import { MinLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Location, LocationLoader } from '../Location/Location';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { ProductionLine } from './ProductionLine';

@InputType()
export class CreateProductionLineInput {
    @MinLength(2)
    @Field()
    name!: string;

    @Field(() => ObjectIdScalar)
    location!: Ref<Location>;

    public async validateProductionLine(
        context: Context
    ): Promise<ProductionLine> {
        const location = await LocationLoader.load(this.location, true);
        return {
            ...context.base,
            name: this.name,
            location: this.location,
        };
    }
}

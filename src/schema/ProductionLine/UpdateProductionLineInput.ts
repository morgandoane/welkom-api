import { Field, InputType } from 'type-graphql';
import { ProductionLine } from './ProductionLine';

@InputType()
export class UpdateProductionLineInput {
    @Field({ nullable: true })
    name?: string;

    public async serializeProductionLineUpdate(): Promise<
        Partial<ProductionLine>
    > {
        const res: Partial<ProductionLine> = {};

        if (this.name) res.name = this.name;

        return res;
    }
}

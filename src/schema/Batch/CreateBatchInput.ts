import { CompanyLoader } from './../Company/Company';
import { ObjectIdScalar } from './../ObjectIdScalar/ObjectIdScalar';
import { ItemLoader } from './../Item/Item';
import { RecipeLoader } from './../Recipe/Recipe';
import {
    CodeGenerator,
    CodeType,
} from './../../services/CodeGeneration/CodeGeneration';
import { Context } from './../../auth/context';
import {
    RecipeVersion,
    RecipeVersionLoader,
} from '../RecipeVersion/RecipeVersion';
import { ProductionLine } from '../ProductionLine/ProductionLine';
import { Ref } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Location, LocationLoader } from '../Location/Location';
import { Batch } from './Batch';
import { BatchLot } from '../BatchLot/BatchLot';
import { Company } from '../Company/Company';

@InputType()
export class CreateBatchInput {
    @Field(() => ObjectIdScalar, { nullable: true })
    recipe_version!: Ref<RecipeVersion> | null;

    @Field(() => ObjectIdScalar)
    location!: Ref<Location>;

    @Field(() => ObjectIdScalar)
    company!: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    production_line!: Ref<ProductionLine> | null;

    public async validateBatch(context: Context): Promise<{
        batch: Batch;
        lot: BatchLot;
    }> {
        const { _id: recipe_version, recipe: recipe_id } =
            await RecipeVersionLoader.load(
                this.recipe_version.toString(),
                true
            );

        const recipe = await RecipeLoader.load(recipe_id.toString(), true);
        const { _id: item, base_unit } = await ItemLoader.load(
            recipe.item.toString(),
            true
        );
        const { _id: company } = await CompanyLoader.load(
            this.company.toString(),
            true
        );

        const { _id: location } = await LocationLoader.load(
            this.location.toString(),
            true
        );

        const { _id: production_line } = !this.production_line
            ? { _id: null }
            : await LocationLoader.load(this.location.toString(), true);

        const lot: BatchLot = {
            ...context.base,
            code: await CodeGenerator.generate(CodeType.LOT),
            item,
            company,
            contents: [],
            quantity: 0,
            base_unit,
            expense_summaries: null,
            expenses: [],
            location,
            production_line,
        };

        const batch: Batch = {
            ...context.base,
            recipe_version,
            location,
            company,
            production_line,
            lot: lot._id,
            date_completed: null,
        };

        return { batch, lot };
    }
}

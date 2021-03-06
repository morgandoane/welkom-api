import {
    ProductionLine,
    ProductionLineLoader,
} from './../ProductionLine/ProductionLine';
import { UserInputError } from 'apollo-server-errors';
import {
    CodeGenerator,
    CodeType,
} from './../../services/CodeGeneration/CodeGeneration';
import { RecipeLoader } from './../Recipe/Recipe';
import { LocationLoader } from './../Location/Location';
import {
    RecipeVersion,
    RecipeVersionLoader,
} from './../RecipeVersion/RecipeVersion';
import { loaderResult } from './../../utils/loaderResult';
import { Context } from './../../auth/context';
import { MixingCard, MixingCardModel } from './../MixingCard/MixingCard';
import { UpdateQuery } from 'mongoose';
import { ProceduralLot } from './../Lot/extensions/ProceduralLot/ProceduralLot';
import { Batch } from './Batch';
import { Field, InputType } from 'type-graphql';
import { Ref } from '@typegoose/typegoose';
import { MixingCardLine } from '../MixingCardLine/MixingCardLine';
import { ObjectIdScalar } from '../ObjectIdScalar';

@InputType()
export class CreateBatchInput {
    @Field(() => ObjectIdScalar, { nullable: true })
    mixing_card_line?: Ref<MixingCardLine>;

    @Field(() => ObjectIdScalar)
    recipe_version!: Ref<RecipeVersion>;

    @Field(() => ObjectIdScalar)
    location!: Ref<ProductionLine>;

    @Field(() => ObjectIdScalar, { nullable: true })
    production_line?: Ref<ProductionLine>;

    public async validateBatchCreation({ base }: Context): Promise<{
        batch: Batch;
        lot: ProceduralLot;
        card_update?: { id: string; update: UpdateQuery<MixingCard> };
    }> {
        const recipeVersion = loaderResult(
            await RecipeVersionLoader.load(this.recipe_version.toString())
        );

        const recipe = loaderResult(
            await RecipeLoader.load(recipeVersion.recipe.toString())
        );

        const location = loaderResult(
            await LocationLoader.load(this.location.toString())
        );
        const production_line = !this.production_line
            ? null
            : loaderResult(
                  await ProductionLineLoader.load(
                      this.production_line.toString()
                  )
              );

        const lot: ProceduralLot = {
            ...base,
            code: await CodeGenerator.generate(CodeType.LOT),
            start_quantity: 0,
            item: recipe.item,
            quality_check_responses: [],
            location: this.location,
            company: location.company,
            contents: [],
        };

        const batch: Batch = {
            ...base,
            recipe_version: this.recipe_version,
            lot: lot._id,
            item: recipe.item,
            location: location._id,
            production_line: production_line?._id || null,
        };

        if (!this.mixing_card_line) {
            return {
                lot,
                batch,
            };
        }

        const card = await MixingCardModel.findOne({
            ['lines._id']: this.mixing_card_line,
        });

        if (!card)
            throw new UserInputError(
                'Failed to find card for line with id ' + this.mixing_card_line
            );

        const matches = card.lines.filter(
            (line) => line.recipe.toString() == recipe._id.toString()
        );

        const bestMatch = matches.find((line) => {
            (line.recipe_version || '').toString() ===
                recipeVersion._id.toString();
        });

        const lineIndex = card.lines
            .map((line) => line._id.toString())
            .indexOf(
                bestMatch ? bestMatch._id.toString() : matches[0]._id.toString()
            );

        if (!card.lines[lineIndex].limit) {
            // do nothing to the mixing card
            return {
                lot,
                batch,
            };
        } else {
            // adjust the limit
            if (card.lines[lineIndex].limit > 2) {
                // drop the limit
                const copy = [...card.lines];
                copy[lineIndex].limit = copy[lineIndex].limit - 1;
                return {
                    lot,
                    batch,
                    card_update: {
                        id: card._id.toString(),
                        update: { lines: copy },
                    },
                };
            } else {
                // drop the line
                const copy = [...card.lines];
                copy.splice(lineIndex, 1);
                return {
                    lot,
                    batch,
                    card_update: {
                        id: card._id.toString(),
                        update: {
                            lines: copy,
                        },
                    },
                };
            }
        }
    }
}

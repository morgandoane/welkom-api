import { PalletCard } from './../PalletCard/PalletCard';
import { BatchModel } from './../Batch/Batch';
import { getPrimitiveUnit } from './../../utils/getPrimitiveUnit';
import { TrayModel } from './../Tray/Tray';
import { LotContentInput } from './../Content/ContentInputs';
import {
    CodeGenerator,
    CodeType,
} from './../../services/CodeGeneration/CodeGeneration';
import { CompanyLoader } from './../Company/Company';
import { LocationLoader } from './../Location/Location';
import { ItemLoader } from '@src/schema/Item/Item';
import { loaderResult } from '@src/utils/loaderResult';
import { BucketLot } from './../Lot/extensions/BucketLot/BucketLot';
import { Context } from '@src/auth/context';
import { Field, InputType } from 'type-graphql';
import { Pallet } from './Pallet';
import { addHours } from 'date-fns';
import { mongoose } from '@typegoose/typegoose';
import { UnitClass } from '../Unit/Unit';
import { RecipeVersionLoader } from '../RecipeVersion/RecipeVersion';
import { Content } from '../Content/Content';
import { ObjectId } from 'mongoose';
import { LotContent } from '../Content/LotContent';

@InputType()
export class CreatePalletInput {
    @Field()
    item!: string;

    @Field()
    company!: string;

    @Field()
    location!: string;

    @Field(() => [LotContentInput])
    contents!: LotContentInput[];

    @Field()
    recipe_version!: string | null;

    @Field({ nullable: true, defaultValue: false })
    include_trays?: boolean;

    @Field(() => [String])
    production_lines!: string[];

    public static fromPalletCard(card: PalletCard): CreatePalletInput {
        const input = new CreatePalletInput();
        input.item = card.item.toString();
        input.company = card.company.toString();
        input.location = card.location.toString();
        input.recipe_version = null;
        input.include_trays = card.include_trays;
        input.production_lines = card.production_lines.map((l) => l.toString());
        input.contents = card.contents.map((content) => ({
            quantity: content.quantity,
            unit: content.unit as unknown as ObjectId,
            lot: content.lot as unknown as ObjectId,
            validateContent: async (): Promise<Content> => {
                return {
                    quantity: content.quantity,
                    unit: content.unit,
                };
            },
            validateLotContent: async (): Promise<LotContent> => {
                return {
                    quantity: content.quantity,
                    unit: content.unit,
                    lot: content.lot,
                };
            },
        }));

        return input;
    }

    public async validatePallet(
        context: Context
    ): Promise<{ pallet: Pallet; lot: BucketLot }> {
        const item = loaderResult(await ItemLoader.load(this.item));
        const location = loaderResult(await LocationLoader.load(this.location));
        const company = loaderResult(await CompanyLoader.load(this.company));
        const version = this.recipe_version
            ? loaderResult(await RecipeVersionLoader.load(this.recipe_version))
            : null;

        const { base } = context;

        const lot: BucketLot = {
            ...base,
            contents: [],
            code: await CodeGenerator.generate(CodeType.LOT),
            start_quantity: 0,
            item: item._id,
            quality_check_responses: [],
            location: location._id,
            company: company._id,
        };

        const pallet: Pallet = {
            ...base,
            lot: lot._id,
            item: item._id,
            location: location._id,
            recipe_version: version?._id || null,
        };

        for (const content of this.contents) {
            lot.contents.push(await content.validateLotContent());
        }

        // Tray inclusion
        if (this.include_trays == true) {
            // get all trays for these items, scanned in the last *little while*
            const trays = await TrayModel.find({
                location: location._id,
                last_scan: { $gte: addHours(new Date(), -3) },
            });

            for (const tray of trays) {
                const results = loaderResult(
                    await ItemLoader.loadMany(
                        tray.items.map((i) => i.toString())
                    )
                );

                const items = results.map((res) => loaderResult(res));

                if (items.length > 0) {
                    const { unit_class } = items[0];
                    const unit = await getPrimitiveUnit(unit_class, context);
                    for (const trayLot of tray.lots) {
                        lot.contents.push({
                            lot: trayLot as unknown as ObjectId,
                            quantity: 0,
                            unit: unit._id,
                        });
                    }
                }
            }
        }

        if (this.production_lines.length > 0) {
            const batches = await BatchModel.find({
                deleted: false,
                date_completed: {
                    $gte: addHours(new Date(), -1),
                },
                production_line: {
                    $in: this.production_lines.map(
                        (line) => new mongoose.Types.ObjectId(line)
                    ),
                },
            });

            const unit = await getPrimitiveUnit(UnitClass.Weight, context);
            for (const batch of batches) {
                lot.contents.push({
                    lot: batch._id as unknown as ObjectId,
                    quantity: 0,
                    unit: unit._id,
                });
            }
        }

        return {
            pallet,
            lot,
        };
    }
}

import { RecipeStep } from './../RecipeStep/RecipeStep';
import { LotLoader } from './../Lot/Lot';
import {
    ProceduralLot,
    ProceduralLotLoader,
    ProceduralLotModel,
} from './../Lot/extensions/ProceduralLot/ProceduralLot';
import { ObjectIdScalar } from '../ObjectIdScalar';
import { Lot, LotModel } from '../Lot/Lot';
import { RecipeVersionLoader } from '../RecipeVersion/RecipeVersion';
import { BatchLoader, BatchModel } from '../Batch/Batch';
import { loaderResult } from '../../utils/loaderResult';
import { Permitted } from '@src/auth/middleware/Permitted';
import { BatchLine } from './BatchLine';
import { Arg, Mutation, Resolver, UseMiddleware, Query } from 'type-graphql';
import { Permission } from '@src/auth/permissions';
import { BatchLineInput } from './BatchLineInput';
import { mongoose, DocumentType, Ref } from '@typegoose/typegoose';
import { FilterQuery, ObjectId } from 'mongoose';
import { ProceduralLotContentInput } from '../Content/ContentInputs';

@Resolver(() => BatchLine)
export class BatchLineResolvers {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateBatch })
    )
    @Query(() => [BatchLine])
    async batchLine(
        @Arg('input', () => BatchLineInput) input: BatchLineInput
    ): Promise<BatchLine[]> {
        const batch = await BatchModel.findById(input.batch);
        const redcipeVersion = loaderResult(
            await RecipeVersionLoader.load(batch.recipe_version.toString())
        );

        const steps: RecipeStep[] = redcipeVersion.sections
            .map((s) => s.steps)
            .flat();
        const potentialSteps = steps.filter((s) =>
            input.active_steps
                .map((t) => t.toString())
                .includes(s._id.toString())
        );

        const potentialItems: string[] = [];

        for (const step of potentialSteps) {
            if (step.content) {
                for (const item of step.content.items) {
                    potentialItems.push(item.toString());
                }
            }
        }

        const isId =
            mongoose.Types.ObjectId.isValid(input.code_or_id) &&
            new mongoose.Types.ObjectId(input.code_or_id).toString() ===
                input.code_or_id;

        const query: FilterQuery<DocumentType<Lot>> = isId
            ? { _id: input.code_or_id }
            : {
                  item: {
                      $in: potentialItems.map(
                          (item) => new mongoose.Types.ObjectId(item)
                      ),
                  },
                  code: input.code_or_id,
              };

        const potentialLots = await LotModel.find(query);

        return potentialLots.map((lot) => {
            const steps = potentialSteps.filter(
                (s) =>
                    s.content &&
                    s.content.items
                        .map((i) => i.toString())
                        .includes(lot.item.toString())
            );

            return {
                lot: lot.toJSON() as unknown as Lot,
                steps,
            };
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateBatch })
    )
    @Mutation(() => ProceduralLot)
    async addBatchLot(
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data', () => ProceduralLotContentInput)
        data: ProceduralLotContentInput
    ): Promise<ProceduralLot> {
        const content = await data.validateProceduralLotContent();
        const batch = loaderResult(await BatchLoader.load(id.toString()));

        const update = await ProceduralLotModel.findByIdAndUpdate(
            batch.lot,
            {
                $push: { contents: content },
            },
            { new: true }
        );

        LotLoader.clear(batch.lot.toString());
        ProceduralLotLoader.clear(batch.lot.toString());
        BatchLoader.clear(batch._id.toString());

        return update.toJSON() as unknown as ProceduralLot;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateBatch })
    )
    @Mutation(() => ProceduralLot)
    async dropBatchLot(
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('recipe_step', () => ObjectIdScalar) recipe_step: ObjectId,
        @Arg('lot', () => ObjectIdScalar) lot: ObjectId
    ): Promise<ProceduralLot> {
        const batch = loaderResult(await BatchLoader.load(id.toString()));
        const update = await ProceduralLotModel.findByIdAndUpdate(
            batch.lot,
            { $pull: { contents: { lot, recipe_step } } },
            { new: true }
        );

        ProceduralLotLoader.clear(batch.lot.toString());

        return update.toJSON() as unknown as ProceduralLot;
    }
}

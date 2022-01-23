import { MixingCardModel } from './../MixingCard/MixingCard';
import { ProceduralLotModel } from './../Lot/extensions/ProceduralLot/ProceduralLot';
import { CreateBatchInput } from './CreateBatchInput';
import { Context } from './../../auth/context';
import { Permitted } from '@src/auth/middleware/Permitted';
import { createBaseResolver } from './../Base/BaseResolvers';
import { Batch, BatchModel } from './Batch';
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import { Permission } from '@src/auth/permissions';

export const BaseResolvers = createBaseResolver();

@Resolver(() => Batch)
export class BatchResolvers extends BaseResolvers {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateBatch })
    )
    @Mutation(() => Batch)
    async createBatch(
        @Ctx() context: Context,
        @Arg('data') data: CreateBatchInput
    ): Promise<Batch> {
        const { lot, batch, card_update } = await data.validateBatchCreation(
            context
        );

        const lotDoc = await ProceduralLotModel.create(lot);
        const batchDoc = await BatchModel.create(batch);

        if (card_update) {
            await MixingCardModel.findByIdAndUpdate(
                card_update.id,
                card_update.update
            );
        }

        return batchDoc.toJSON();
    }
}

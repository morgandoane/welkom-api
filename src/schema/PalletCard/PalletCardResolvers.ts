import { getPrimitiveUnit } from './../../utils/getPrimitiveUnit';
import { LotLoader } from './../Lot/Lot';
import { UserInputError } from 'apollo-server-errors';
import { CompanyLoader } from './../Company/Company';
import { ItemLoader } from '@src/schema/Item/Item';
import { ProductionLineLoader } from './../ProductionLine/ProductionLine';
import { CreatePalletInput } from './../Pallet/CreatePalletInput';
import { PalletCardInput } from './PalletCardInput';
import { ObjectId } from 'mongoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { loaderResult } from './../../utils/loaderResult';
import { Context } from './../../auth/context';
import { Pallet, PalletModel } from './../Pallet/Pallet';
import { Location, LocationLoader } from './../Location/Location';
import {
    PalletCard,
    PalletCardModel,
    PalletCardProfileLoader,
} from './PalletCard';
import {
    Mutation,
    Resolver,
    UseMiddleware,
    Query,
    Ctx,
    Arg,
    FieldResolver,
    Root,
} from 'type-graphql';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { LotContent } from '../Content/LotContent';
import { BucketLotModel } from '../Lot/extensions/BucketLot/BucketLot';
import { ProductionLine } from '../ProductionLine/ProductionLine';
import { Company } from '../Company/Company';
import { Item } from '../Item/Item';

@Resolver(() => PalletCard)
export class PalletCardResolvers {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreatePallet })
    )
    @Query(() => PalletCard, { nullable: true })
    async palletCard(@Ctx() { base }: Context): Promise<PalletCard> {
        const card = await PalletCardModel.findOne({
            profile: base.created_by,
            closed: false,
        });

        if (!card) return null;
        else return card.toJSON() as unknown as PalletCard;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreatePallet })
    )
    @Mutation(() => PalletCard)
    async createPalletCard(
        @Ctx() context: Context,
        @Arg('data', () => PalletCardInput) data: PalletCardInput
    ): Promise<PalletCard> {
        const res = await PalletCardModel.create(
            await data.validatePalletCard(context)
        );

        return res.toJSON() as unknown as PalletCard;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreatePallet })
    )
    @Mutation(() => PalletCard)
    async updatePalletCard(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data', () => PalletCardInput) data: PalletCardInput
    ): Promise<PalletCard> {
        const { _id, ...rest } = await data.validatePalletCard(context);
        const res = await PalletCardModel.findOneAndUpdate(
            { _id: id.toString() },
            { ...rest },
            { new: true, upsert: true }
        );

        PalletCardProfileLoader.clear(res.profile);

        return res.toJSON() as unknown as PalletCard;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreatePallet })
    )
    @Mutation(() => Boolean)
    async addPalletCardLot(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<boolean> {
        const { base, roles } = context;
        const card = await PalletCardModel.findOne({
            profile: base.created_by,
            closed: false,
        });

        if (!card) throw new UserInputError('No pallet card avaliable');

        const lot = loaderResult(await LotLoader.load(id.toString()));
        const item = loaderResult(await ItemLoader.load(lot.item.toString()));

        const primitiveUnit = await getPrimitiveUnit(item.unit_class, context);

        if (
            !card.contents
                .map((c) => c.lot.toString())
                .includes(lot._id.toString())
        )
            card.contents.push({
                quantity: 0,
                unit: primitiveUnit._id,
                lot: lot._id as unknown as ObjectId,
            });

        await card.save();

        PalletCardProfileLoader.clear(base.created_by);

        return true;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreatePallet })
    )
    @Mutation(() => Pallet)
    async createPalletFromCard(@Ctx() context: Context): Promise<Pallet> {
        const card = await PalletCardModel.findOne({
            profile: context.base.created_by,
            closed: false,
        });

        const data = CreatePalletInput.fromPalletCard(card);

        const { pallet, lot } = await data.validatePallet(context);

        await BucketLotModel.create(lot);
        const palletRes = await PalletModel.create(pallet);

        return palletRes.toJSON() as unknown as Pallet;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreatePallet })
    )
    @Mutation(() => Boolean)
    async closePalletCard(@Ctx() context: Context): Promise<boolean> {
        const res = await PalletCardModel.updateMany(
            { profile: context.base.created_by },
            { closed: true }
        );

        PalletCardProfileLoader.clear(context.base.created_by);
        return true;
    }

    @FieldResolver(() => [ProductionLine])
    async production_lines(
        @Root() { production_lines }: PalletCard
    ): Promise<ProductionLine[]> {
        const res = await ProductionLineLoader.loadMany(
            production_lines.map((s) => s.toString())
        );

        return res.map((doc) => loaderResult(doc));
    }

    @FieldResolver(() => String)
    profile(@Root() { profile }: PalletCard): string {
        return profile.toString();
    }

    @FieldResolver(() => Item)
    async item(@Root() { item }: PalletCard): Promise<Item> {
        return loaderResult(await ItemLoader.load(item.toString()));
    }

    @FieldResolver(() => Company)
    async company(@Root() { company }: PalletCard): Promise<Company> {
        return loaderResult(await CompanyLoader.load(company.toString()));
    }

    @FieldResolver(() => Location)
    async location(@Root() { location }: PalletCard): Promise<Location> {
        return loaderResult(await LocationLoader.load(location.toString()));
    }
}

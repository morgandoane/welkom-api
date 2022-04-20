import { UserInputError } from 'apollo-server-errors';
import { createVerifiedResolver } from './../Verified/VerifiedResolvers';
import { CreateVerificationInput } from './../Verification/VerificationInput';
import {
    VerificationModel,
    VerificationLoader,
} from './../Verification/Verification';
import { Bol, BolLoader, BolModel } from './../Bol/Bol';
import { ObjectId } from 'mongoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Item, ItemLoader } from './../Item/Item';
import { Company, CompanyLoader } from './../Company/Company';
import { Context } from './../../auth/context';
import { Paginate } from './../Paginate';
import { FulfillmentFilter } from './FulfillmentFilter';
import { FulfillmentList } from './FulfillmentList';
import { Lot, LotLoader } from './../Lot/Lot';
import { FulfillmentInput, UpdateFulfillmentInput } from './FulfillmentInput';
import { Location, LocationLoader } from './../Location/Location';
import { loaderResult } from './../../utils/loaderResult';
import {
    Fulfillment,
    FulfillmentModel,
    FulfillmentLoader,
} from './Fulfillment';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from 'type-graphql';
import { StorageBucket } from '@src/services/CloudStorage/CloudStorage';
import { AppFile } from '../AppFile/AppFile';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import {
    FlashFulfillmentInput,
    UpdateFlashFulfillmentInput,
} from './FlashFulfillmentInput';
import { ItineraryModel } from '../Itinerary/Itinerary';

const VerifiedResolvers = createVerifiedResolver();

@Resolver(() => Fulfillment)
export class FulfillmentResolvers extends VerifiedResolvers {
    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetFulfillments,
        })
    )
    @Query(() => Fulfillment)
    async fulfillment(
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<Fulfillment> {
        return loaderResult(await FulfillmentLoader.load(id.toString()));
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.GetFulfillments,
        })
    )
    @Query(() => FulfillmentList)
    async fulfillments(
        @Arg('filter') filter: FulfillmentFilter
    ): Promise<FulfillmentList> {
        return await Paginate.paginate({
            model: FulfillmentModel,
            query: filter.serializeFulfillmentFilter(),
            sort: { date_created: -1 },
            skip: filter.skip,
            take: filter.take,
        });
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.CreateFulfillment,
        })
    )
    @Mutation(() => Fulfillment)
    async createFulfillment(
        @Ctx() context: Context,
        @Arg('data') data: FulfillmentInput
    ): Promise<Fulfillment> {
        const bol = await BolModel.findOne({ _id: data.bol.toString() });
        const doc = await data.validateFulfillment(context);
        const res = await FulfillmentModel.create(doc);

        if (data.bol_code_override) {
            bol.code = data.bol_code_override;
        }

        if (data.seal) {
            bol.seal = data.seal;
        }

        await BolModel.findOneAndUpdate(
            { _id: bol._id },
            { code: bol.code, seal: bol.seal }
        );
        BolLoader.clear(bol._id.toString());

        return res.toJSON() as unknown as Fulfillment;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.UpdateFulfillment,
        })
    )
    @Mutation(() => Fulfillment)
    async updateFulfillment(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data') data: UpdateFulfillmentInput
    ): Promise<Fulfillment> {
        const bol = await BolModel.findOne({ _id: data.bol.toString() });
        const fulfillment = loaderResult(
            await FulfillmentLoader.load(id.toString())
        );
        const update = await data.validateFulfillmentUpdate(context);
        const { created_by, date_created, _id, ...rest } = update;
        const res = await FulfillmentModel.findByIdAndUpdate(id, rest, {
            new: true,
        });

        FulfillmentLoader.clear(res._id.toString());

        if (data.bol_code_override) {
            bol.code = data.bol_code_override;
        }

        if (data.seal) {
            bol.seal = data.seal;
        }

        await BolModel.findOneAndUpdate(
            { _id: bol._id },
            { code: bol.code, seal: bol.seal }
        );
        BolLoader.clear(bol._id.toString());

        return res.toJSON() as unknown as Fulfillment;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.VerifyFulfillment,
        })
    )
    @Mutation(() => Fulfillment)
    async verifyFulfillment(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data', () => CreateVerificationInput)
        data: CreateVerificationInput
    ): Promise<Fulfillment> {
        const fulfillment = await FulfillmentModel.findById(id);
        if (!fulfillment)
            throw new UserInputError(
                'Failed to find fulfillment with id ' + id.toString()
            );

        if (fulfillment.verification) {
            await VerificationModel.findByIdAndDelete(fulfillment.verification);
            VerificationLoader.clear(fulfillment.verification.toString());
        }

        const res = await VerificationModel.create(data.validate(context));
        fulfillment.verification = res._id;
        await fulfillment.save();
        FulfillmentLoader.clear(id.toString());

        return loaderResult(await FulfillmentLoader.load(id.toString()));
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.FlashFulfillment,
        })
    )
    @Mutation(() => Fulfillment)
    async flashFulfillment(
        @Ctx() context: Context,
        @Arg('data', () => FlashFulfillmentInput)
        data: FlashFulfillmentInput
    ): Promise<Fulfillment> {
        const { itinerary, bol, fulfillment } =
            await data.validateFlashFulfillment(context);

        await ItineraryModel.create(itinerary);
        await BolModel.create(bol);
        const res = await FulfillmentModel.create(fulfillment);

        return res.toJSON() as unknown as Fulfillment;
    }

    @UseMiddleware(
        Permitted({
            type: 'permission',
            permission: Permission.FlashFulfillment,
        })
    )
    @Mutation(() => Fulfillment)
    async updateFlashFulfillment(
        @Ctx() context: Context,
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data', () => UpdateFlashFulfillmentInput)
        data: UpdateFlashFulfillmentInput
    ): Promise<Fulfillment> {
        const {
            fulfillment_update: {
                doc: { _id: fulfill_id, ...filfillUpdate },
            },
            bol_update: {
                doc: { _id: bol_id, ...bolUpdate },
            },
            itinerary_update: {
                doc: { _id: itin_id, ...itinUpdate },
            },
        } = await data.validateFlashFulfillmentUpdate(context, id);

        await ItineraryModel.findByIdAndUpdate(itin_id, itinUpdate);
        await BolModel.findByIdAndUpdate(bol_id, bolUpdate);
        const res = await FulfillmentModel.findByIdAndUpdate(
            fulfill_id,
            filfillUpdate
        );

        return res.toJSON() as unknown as Fulfillment;
    }

    @FieldResolver(() => Location)
    async location(@Root() { location }: Fulfillment): Promise<Location> {
        return loaderResult(await LocationLoader.load(location.toString()));
    }

    @FieldResolver(() => Company)
    async company(@Root() { company }: Fulfillment): Promise<Company> {
        return loaderResult(await CompanyLoader.load(company.toString()));
    }

    @FieldResolver(() => Bol)
    async bol(@Root() { bol }: Fulfillment): Promise<Bol> {
        return loaderResult(await BolLoader.load(bol.toString()));
    }

    @FieldResolver(() => [Item])
    async items(@Root() { items }: Fulfillment): Promise<Item[]> {
        const results = await ItemLoader.loadMany(
            items.map((i) => i.toString())
        );
        const itemDocs = results.map((result) => loaderResult(result));
        return itemDocs;
    }

    @FieldResolver(() => [Lot])
    async lots(@Root() { lots }: Fulfillment): Promise<Lot[]> {
        const res = await LotLoader.loadMany(lots.map((lot) => lot.toString()));
        return res.map((result) => loaderResult(result));
    }

    @FieldResolver(() => [AppFile])
    async files(
        @Ctx() { storage }: Context,
        @Root() { _id }: Fulfillment
    ): Promise<AppFile[]> {
        const files = await storage.files(
            StorageBucket.Attachments,
            _id.toString()
        );

        return files.map((file) => AppFile.fromFile(file, _id.toString()));
    }
}

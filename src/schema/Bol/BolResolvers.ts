import { AppStorage } from './../../services/CloudStorage/CloudStorage';
import { UserLoader } from '@src/services/AuthProvider/AuthProvider';
import { ProfileModel } from './../Profile/Profile';
import { BolFile } from './../AppFile/extensons/BolFile/BolFile';
import { Order, OrderLoader, OrderModel } from './../Order/Order';
import { Pagination } from './../Pagination/Pagination';
import { BolFilter } from './BolFilter';
import { BolList } from './BolList';
import { Context } from './../../auth/context';
import { createBaseResolver } from './../Base/BaseResolvers';
import {
    Fulfillment,
    FulfillmentModel,
    FulfillmentType,
} from './../Fulfillment/Fulfillment';
import {
    Itinerary,
    ItineraryLoader,
    ItineraryModel,
} from './../Itinerary/Itinerary';
import { UpdateBolInput, CreateBolInput } from './BolInput';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { LocationLoader } from './../Location/Location';
import { CompanyLoader } from './../Company/Company';
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
import { Bol, BolLoader, BolModel, BolSignature } from './Bol';
import { Paginate } from '../Paginate';
import { loaderResult } from '@src/utils/loaderResult';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { AppFile } from '../AppFile/AppFile';
import { StorageBucket } from '@src/services/CloudStorage/CloudStorage';
import { DocumentReader } from '@src/services/CloudStorage/DocumentAi';

const BaseResolvers = createBaseResolver();

@Resolver(() => Bol)
export class BolResolvers extends BaseResolvers {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetBols })
    )
    @Query(() => Bol)
    async bol(@Arg('id', () => ObjectIdScalar) id: ObjectId): Promise<Bol> {
        return loaderResult(await BolLoader.load(id.toString()));
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetBols })
    )
    @Query(() => BolList)
    async bols(@Arg('filter') filter: BolFilter): Promise<BolList> {
        const query = await filter.serializeBolFilter();
        const res = await Paginate.paginate({
            model: BolModel,
            query,
            sort: { date_created: -1 },
            skip: filter.skip,
            take: filter.take,
        });
        return res;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateBol })
    )
    @Mutation(() => Bol)
    async createBol(
        @Arg('data') data: CreateBolInput,
        @Ctx() context: Context
    ): Promise<Bol> {
        const res = await BolModel.create(await data.validateBol(context));
        return res.toJSON();
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateBol })
    )
    @Mutation(() => Bol)
    async updateBol(
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data') data: UpdateBolInput
    ): Promise<Bol> {
        const res = await BolModel.findByIdAndUpdate(
            id,
            await data.serializeBolUpdate(),
            { new: true }
        );

        BolLoader.clear(id.toString());

        return res.toJSON();
    }

    @FieldResolver(() => [Fulfillment])
    async shipments(
        @Root() bol: Bol,
        @Arg('show_deleted', () => Boolean, { defaultValue: false })
        show_deleted: boolean
    ): Promise<Fulfillment[]> {
        const docs = await FulfillmentModel.find({
            deleted: show_deleted ? undefined : false,
            bol: bol._id,
            type: FulfillmentType.Shipment,
        });

        return docs.map((doc) => doc.toJSON()) as Fulfillment[];
    }

    @FieldResolver(() => [Fulfillment])
    async receipts(
        @Root() bol: Bol,
        @Arg('show_deleted', () => Boolean, { defaultValue: false })
        show_deleted: boolean
    ): Promise<Fulfillment[]> {
        const docs = await FulfillmentModel.find({
            deleted: show_deleted ? undefined : false,
            bol: bol._id,
            type: FulfillmentType.Receipt,
        });

        return docs.map((doc) => doc.toJSON()) as Fulfillment[];
    }

    @FieldResolver(() => Itinerary)
    async itinerary(@Root() { itinerary }: Bol): Promise<Itinerary> {
        return loaderResult(await ItineraryLoader.load(itinerary.toString()));
    }

    @FieldResolver(() => [Order])
    async orders(@Root() { itinerary }: Bol): Promise<Order[]> {
        const itineraryDoc = loaderResult(
            await ItineraryLoader.load(itinerary.toString())
        );
        const res = await OrderModel.find({
            deleted: false,
            _id: { $in: itineraryDoc.orders.map((o) => o.toString()) },
        });

        return res.map((doc) => doc.toJSON());
    }

    @FieldResolver(() => AppFile, { nullable: true })
    async file(
        @Ctx() { storage }: Context,
        @Root() bol: Bol
    ): Promise<AppFile> {
        const bucket = AppStorage.bucket(StorageBucket.Profiles);

        const files = await storage.files(
            StorageBucket.Profiles,
            bol._id.toString()
        );

        console.log(files);

        if (!files[0]) return null;
        else return AppFile.fromFile(files[0], bol._id.toString());
    }

    @FieldResolver(() => [BolSignature])
    async signatures(
        @Ctx() { storage }: Context,
        @Root() bol: Bol
    ): Promise<BolSignature[]> {
        // Will update soon, needs work
        return [];
        const files = await storage.files(
            StorageBucket.Profiles,
            bol._id.toString()
        );

        if (!files[0]) return [];

        const signatures: BolSignature[] = [];

        const results = await DocumentReader.readFile(files[0]);

        if (results && results.document_result) {
            if (results.document_result.text) {
                const text = results.document_result.text
                    .replace(/(\r\n|\n|\r)/gm, '')
                    .split(' ')
                    .join('')
                    .toLowerCase();

                const shipment = await FulfillmentModel.findOne({
                    type: FulfillmentType.Shipment,
                    deleted: false,
                    bol: bol._id,
                });

                const receipt = await FulfillmentModel.findOne({
                    type: FulfillmentType.Receipt,
                    deleted: false,
                    bol: bol._id,
                });

                const users: { user_id: string; name: string }[] =
                    await ProfileModel.aggregate([
                        {
                            $project: {
                                user_id: '$user_id',
                                name: {
                                    $concat: ['$given_name', '$family_name'],
                                },
                                _id: 0,
                            },
                        },
                    ]);

                if (receipt) {
                    const match = users.find((u) =>
                        text.includes(u.name.toLowerCase().split(' ').join(''))
                    );

                    if (match) {
                        const signedBy = loaderResult(
                            await UserLoader.load(match.user_id)
                        );

                        signatures.push({
                            profile: signedBy,
                            confidence: 1,
                            fulfillment_type: FulfillmentType.Receipt,
                        });
                    }
                }
                if (shipment) {
                    const match = users.find((u) =>
                        text.includes(u.name.toLowerCase().split(' ').join(''))
                    );

                    if (match) {
                        const signedBy = loaderResult(
                            await UserLoader.load(match.user_id)
                        );

                        signatures.push({
                            profile: signedBy,
                            confidence: 1,
                            fulfillment_type: FulfillmentType.Shipment,
                        });
                    }
                }
            }
        }

        return signatures;
    }
}

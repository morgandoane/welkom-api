import { ItineraryModel } from '@src/schema/Itinerary/Itinerary';
import { Itinerary, ItineraryLoader } from './../Itinerary/Itinerary';
import { Paginate } from '../Pagination/Pagination';
import { BolFilter } from './BolFilter';
import { BolList } from './BolList';
import { Ref } from '@typegoose/typegoose';
import { Context } from '@src/auth/context';
import { CreateBolInput } from './CreateBolInput';
import { createUploadEnabledResolver } from '../UploadEnabled/UploadEnabledResolvers';
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
import { Bol } from './Bol';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { UpdateBolInput } from './UpdateBolInput';
import { BolModel, BolLoader } from './BolModel';

const UploadEnabledResolver = createUploadEnabledResolver();

@Resolver(() => Bol)
export class BolResolvers extends UploadEnabledResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetBols })
    )
    @Query(() => BolList)
    async bols(@Arg('filter') filter: BolFilter): Promise<BolList> {
        return await Paginate.paginate({
            model: BolModel,
            query: await filter.serializeBolFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetBols })
    )
    @Query(() => Bol)
    async bol(@Arg('id', () => ObjectIdScalar) id: Ref<Bol>): Promise<Bol> {
        return await BolLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateBol })
    )
    @Mutation(() => Bol)
    async createBol(
        @Ctx() context: Context,
        @Arg('data', () => CreateBolInput) data: CreateBolInput
    ): Promise<Bol> {
        const bol = await data.validateBol(context);
        const bolRes = await BolModel.create(bol);
        const itinRes = await ItineraryModel.findOneAndUpdate(
            { _id: bolRes.itinerary },
            {
                $addToSet: { bols: bolRes._id },
            },
            { new: true }
        );
        ItineraryLoader.clear(itinRes._id.toString());
        return bolRes;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateBol })
    )
    @Mutation(() => Bol)
    async updateBol(
        @Arg('id', () => ObjectIdScalar) id: Ref<Bol>,
        @Arg('data', () => UpdateBolInput) data: UpdateBolInput
    ): Promise<Bol> {
        const res = await BolModel.findByIdAndUpdate(
            id,
            await data.serializeBolUpdate(),
            { new: true }
        );

        const itinRes = await ItineraryModel.findOneAndUpdate(
            { _id: res.itinerary },
            {
                $addToSet: { bols: res._id },
            },
            { new: true }
        );
        ItineraryLoader.clear(itinRes._id.toString());
        BolLoader.clear(id);

        return res;
    }

    @FieldResolver(() => Itinerary)
    async itinerary(@Root() { itinerary }: Bol): Promise<Itinerary> {
        return await ItineraryLoader.load(itinerary, true);
    }
}

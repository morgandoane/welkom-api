import { Lot, LotLoader, LotModel } from './../Lot/Lot';
import { LocationLoader } from './../Location/Location';
import { CodeType } from '@src/services/CodeGeneration/CodeGeneration';
import { CodeGenerator } from './../../services/CodeGeneration/CodeGeneration';
import { CreateTraysArg } from './CreateTraysArg';
import { Paginate } from '@src/schema/Paginate';
import { TrayFilter } from './TrayFilter';
import { TrayList } from './TrayList';
import { Permitted } from '@src/auth/middleware/Permitted';
import { loaderResult } from '@src/utils/loaderResult';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar';
import { Tray, TrayLoader, TrayModel } from './Tray';
import {
    Arg,
    Query,
    Resolver,
    UseMiddleware,
    Mutation,
    Args,
    FieldResolver,
    Root,
} from 'type-graphql';
import { ObjectId } from 'mongoose';
import { mongoose } from '@typegoose/typegoose';

@Resolver(() => Tray)
export class TrayResolvers {
    @UseMiddleware(Permitted())
    @Query(() => Tray)
    async tray(@Arg('id', () => ObjectIdScalar) id: ObjectId): Promise<Tray> {
        return loaderResult(await TrayLoader.load(id.toString()));
    }

    @UseMiddleware(Permitted())
    @Query(() => TrayList)
    async trays(
        @Arg('filter', () => TrayFilter) filter: TrayFilter
    ): Promise<TrayList> {
        return await Paginate.paginate({
            model: TrayModel,
            query: await filter.serialize(),
            sort: { date_created: -1 },
            skip: filter.skip,
            take: filter.take,
        });
    }

    @UseMiddleware(Permitted())
    @Mutation(() => [Tray])
    async createTrays(
        @Args(() => CreateTraysArg) { count, location }: CreateTraysArg
    ): Promise<Tray[]> {
        const locationDoc = loaderResult(await LocationLoader.load(location));

        const docs: Tray[] = [];

        for (const index of Array.from(Array(count).keys())) {
            const doc: Tray = {
                date_created: new Date(),
                _id: new mongoose.Types.ObjectId() as unknown as ObjectId,
                code: await CodeGenerator.generate(CodeType.TR),
                lots: [],
                location: locationDoc._id,
                last_scan: null,
                items: [],
            };

            docs.push(doc);
        }

        const res = await TrayModel.create(docs);

        return res.map((doc) => doc.toJSON() as unknown as Tray);
    }

    @UseMiddleware(Permitted())
    @Mutation(() => Tray)
    async assignTrayContents(
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('lots', () => [String]) lots: string[]
    ): Promise<Tray> {
        const lotDocs = await LotModel.find({
            _id: { $in: lots.map((l) => new mongoose.Types.ObjectId(l)) },
        });

        const res = await TrayModel.findByIdAndUpdate({
            lots: lotDocs.map((l) => l._id),
            items: lotDocs.map((i) => i.item),
        });

        TrayLoader.clear(id.toString());

        return res.toJSON() as unknown as Tray;
    }

    @FieldResolver(() => String)
    async location(@Root() { location }: Tray): Promise<string> {
        return location.toString();
    }

    @FieldResolver(() => [Lot])
    async lots(@Root() { lots }: Tray): Promise<Lot[]> {
        const results = await LotLoader.loadMany(lots.map((l) => l.toString()));

        return results.map((res) => loaderResult(res));
    }

    @FieldResolver(() => [String])
    async items(@Root() { items }: Tray): Promise<string[]> {
        return items.map((i) => i.toString());
    }
}

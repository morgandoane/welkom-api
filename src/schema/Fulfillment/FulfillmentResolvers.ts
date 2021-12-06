import { LotLoader } from './../Lot/Lot';
import { LocationLoader } from './../Location/Location';
import { loaderResult } from './../../utils/loaderResult';
import { Fulfillment } from './Fulfillment';
import { FieldResolver, Resolver, Root } from 'type-graphql';
import { createConfiguredResolver } from '../Configured/ConfiguredResolver';
import { Lot } from '../Lot/Lot';
import { Location } from '../Location/Location';

const ConfiguredResolver = createConfiguredResolver();

@Resolver(() => Fulfillment)
export class FulfillmentResolvers extends ConfiguredResolver {
    // @FieldResolver(() => [Lot])
    // async lots(@Root() { lots }: Fulfillment): Promise<Lot[]> {
    //     const docs = await LotLoader.loadMany(
    //         lots.map((lot) => lot.toString())
    //     );

    //     for (const doc of docs) {
    //         if (doc instanceof Error) throw doc;
    //     }

    //     console.log(docs);

    //     return docs as Lot[];
    // }

    @FieldResolver(() => Location)
    async location(@Root() { location }: Fulfillment): Promise<Location> {
        return loaderResult(await LocationLoader.load(location.toString()));
    }
}

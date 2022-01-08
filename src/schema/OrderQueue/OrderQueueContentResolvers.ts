import { Location, LocationLoader } from './../Location/Location';
import { UnitLoader } from './../Unit/Unit';
import { ItemLoader } from './../Item/Item';
import { CompanyLoader } from './../Company/Company';
import { loaderResult } from '@src/utils/loaderResult';
import { FieldResolver, Resolver, Root } from 'type-graphql';
import { Company } from '../Company/Company';
import { Item } from '../Item/Item';
import { Unit } from '../Unit/Unit';
import { OrderQueueContent } from './OrderQueue';

@Resolver(() => OrderQueueContent)
export class OrderQueueContentResolvers {
    @FieldResolver(() => Company)
    async vendor(@Root() { vendor }: OrderQueueContent): Promise<Company> {
        if (!vendor) return null;

        return loaderResult(await CompanyLoader.load(vendor.toString()));
    }

    @FieldResolver(() => Location)
    async vendor_location(
        @Root() { vendor_location }: OrderQueueContent
    ): Promise<Location> {
        if (!vendor_location) return null;

        return loaderResult(
            await LocationLoader.load(vendor_location.toString())
        );
    }

    @FieldResolver(() => Item)
    async item(@Root() { item }: OrderQueueContent): Promise<Item> {
        if (!item) return null;

        return loaderResult(await ItemLoader.load(item.toString()));
    }

    @FieldResolver(() => Unit)
    async unit(@Root() { unit }: OrderQueueContent): Promise<Unit> {
        if (!unit) return null;

        return loaderResult(await UnitLoader.load(unit.toString()));
    }

    @FieldResolver(() => Location)
    async location(@Root() { location }: OrderQueueContent): Promise<Location> {
        if (!location) return null;

        return loaderResult(await LocationLoader.load(location.toString()));
    }
}

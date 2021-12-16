import { createBaseResolver } from './../Base/BaseResolvers';
import { Location, LocationLoader } from './../Location/Location';
import { loaderResult } from './../../utils/loaderResult';
import { Item, ItemLoader } from './../Item/Item';
import { Company, CompanyLoader } from './../Company/Company';
import { Lot } from './Lot';
import { FieldResolver, Resolver, Root } from 'type-graphql';

const BaseResolvers = createBaseResolver();

@Resolver(() => Lot)
export class LotResolvers extends BaseResolvers {
    @FieldResolver(() => Item)
    async item(@Root() lot: Lot): Promise<Item> {
        return loaderResult(await ItemLoader.load(lot.item.toString()));
    }

    @FieldResolver(() => Company)
    async company(@Root() { company }: Lot): Promise<Company> {
        if (!company) return null;
        return loaderResult(await CompanyLoader.load(company.toString()));
    }

    @FieldResolver(() => Location)
    async location(@Root() { location }: Lot): Promise<Location> {
        if (!location) return null;
        return loaderResult(await LocationLoader.load(location.toString()));
    }
}

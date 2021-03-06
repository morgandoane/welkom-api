import { RecipeVersionModel } from './../RecipeVersion/RecipeVersion';
import { RecipeStep } from './../RecipeStep/RecipeStep';
import { ProceduralLotContent } from './../Lot/extensions/ProceduralLot/ProceduralLot';
import { LocationLoader } from './../Location/Location';
import { LotLoader } from './../Lot/Lot';
import { Item, ItemLoader } from './../Item/Item';
import { loaderResult } from './../../utils/loaderResult';
import { Unit, UnitLoader } from './../Unit/Unit';
import { FieldResolver, Resolver, Root, ResolverInterface } from 'type-graphql';
import { Lot } from '../Lot/Lot';
import { Location } from '../Location/Location';
import { Content } from './Content';
import { BolItemContent } from './BolItemContent';
import { ItemContent } from './ItemContent';
import { ItemPluralContent } from './ItemPluralContent';
import { LotContent } from './LotContent';
import { OrderContent } from './OrderContent';

@Resolver(() => Content)
export class ContentResolver {
    @FieldResolver(() => Unit)
    async unit(@Root() root: Content): Promise<Unit> {
        return loaderResult(await UnitLoader.load(root.unit.toString()));
    }
}

@Resolver(() => ItemContent)
export class ItemContentResolver {
    @FieldResolver(() => Unit)
    async unit(@Root() root: Content): Promise<Unit> {
        return loaderResult(await UnitLoader.load(root.unit.toString()));
    }

    @FieldResolver(() => Item)
    async item(@Root() root: ItemContent): Promise<Item> {
        return loaderResult(await ItemLoader.load(root.item.toString()));
    }
}

@Resolver(() => BolItemContent)
export class BolItemContentResolver
    implements ResolverInterface<BolItemContent>
{
    @FieldResolver(() => Number)
    async fulfillment_percentage(
        @Root() { fulfillment_percentage }: BolItemContent
    ): Promise<number> {
        if (isNaN(fulfillment_percentage)) return 0;
        else return parseFloat(fulfillment_percentage + '');
    }
}

@Resolver(() => ItemPluralContent)
export class ItemPluralContentResolver {
    @FieldResolver(() => Unit)
    async unit(@Root() root: Content): Promise<Unit> {
        return loaderResult(await UnitLoader.load(root.unit.toString()));
    }

    @FieldResolver(() => [Item])
    async items(@Root() root: ItemPluralContent): Promise<Item[]> {
        const docs = await ItemLoader.loadMany(
            root.items.map((i) => i.toString())
        );

        for (const doc of docs) {
            if (doc instanceof Error) throw doc;
        }

        return docs.map((d) => loaderResult(d));
    }
}

@Resolver(() => LotContent)
export class LotContentResolver {
    @FieldResolver(() => Unit)
    async unit(@Root() root: Content): Promise<Unit> {
        return loaderResult(await UnitLoader.load(root.unit.toString()));
    }

    @FieldResolver(() => Lot)
    async lot(@Root() root: LotContent): Promise<Lot> {
        return loaderResult(await LotLoader.load(root.lot.toString()));
    }
}

@Resolver(() => ProceduralLotContent)
export class ProceduralLotContentResolver {
    @FieldResolver(() => Unit)
    async unit(@Root() root: ProceduralLotContent): Promise<Unit> {
        return loaderResult(await UnitLoader.load(root.unit.toString()));
    }

    @FieldResolver(() => Lot)
    async lot(@Root() root: ProceduralLotContent): Promise<Lot> {
        return loaderResult(await LotLoader.load(root.lot.toString()));
    }

    @FieldResolver(() => RecipeStep, { nullable: true })
    async recipe_step(
        @Root() { recipe_step }: ProceduralLotContent
    ): Promise<RecipeStep> {
        if (!recipe_step) return null;
        const version = await RecipeVersionModel.findOne({
            'sections.steps._id': recipe_step.toString(),
        });
        return (
            version.sections
                .map((s) => s.steps)
                .flat()
                .find((l) => l._id.toString() == recipe_step.toString()) || null
        );
    }
}

@Resolver(() => OrderContent)
export class OrderContentResolver {
    @FieldResolver(() => Unit)
    async unit(@Root() root: Content): Promise<Unit> {
        return loaderResult(await UnitLoader.load(root.unit.toString()));
    }

    @FieldResolver(() => Item)
    async item(@Root() root: ItemContent): Promise<Item> {
        return loaderResult(await ItemLoader.load(root.item.toString()));
    }

    @FieldResolver(() => Item)
    async location(@Root() root: OrderContent): Promise<Location> {
        return loaderResult(
            await LocationLoader.load(root.location.toString())
        );
    }
}

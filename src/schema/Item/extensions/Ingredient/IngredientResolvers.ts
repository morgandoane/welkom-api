import { Context } from '../../../../auth/context';
import { Ingredient, IngredientLoader, IngredientModel } from './Ingredient';
import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { createItemResolver } from '../../ItemResolver';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar/ObjectIdScalar';
import { Paginate } from '@src/schema/Pagination/Pagination';
import { Ref } from '@typegoose/typegoose';
import { IngredientList } from './IngredientList';
import { IngredientFilter } from './IngredientFilter';
import { CreateIngredientInput } from './CreateIngredientInput';
import { UpdateIngredientInput } from './UpdateIngredientInput';

const ItemResolver = createItemResolver();

@Resolver(() => Ingredient)
export class IngredientResolvers extends ItemResolver {
    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetItems })
    )
    @Query(() => IngredientList)
    async ingredients(
        @Arg('filter') filter: IngredientFilter
    ): Promise<IngredientList> {
        return await Paginate.paginate({
            model: IngredientModel,
            query: await filter.serializeIngredientFilter(),
            skip: filter.skip,
            take: filter.take,
            sort: { date_created: -1 },
        });
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.GetItems })
    )
    @Query(() => Ingredient)
    async ingredient(
        @Arg('id', () => ObjectIdScalar) id: Ref<Ingredient>
    ): Promise<Ingredient> {
        return await IngredientLoader.load(id, true);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateItem })
    )
    @Mutation(() => Ingredient)
    async createIngredient(
        @Ctx() context: Context,
        @Arg('data', () => CreateIngredientInput) data: CreateIngredientInput
    ): Promise<Ingredient> {
        const doc = await data.validateIngredient(context);
        const res = await IngredientModel.create(doc);
        return res.toJSON() as unknown as Ingredient;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.UpdateItem })
    )
    @Mutation(() => Ingredient)
    async updateIngredient(
        @Arg('id', () => ObjectIdScalar) id: Ref<Ingredient>,
        @Arg('data', () => UpdateIngredientInput) data: UpdateIngredientInput
    ): Promise<Ingredient> {
        const res = await IngredientModel.findByIdAndUpdate(
            id,
            await data.serializeIngredientUpdate(),
            { new: true }
        );

        IngredientLoader.clear(id);

        return res.toJSON() as unknown as Ingredient;
    }
}

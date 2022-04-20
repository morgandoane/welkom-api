import { Context } from '@src/auth/context';
import { Permitted } from '@src/auth/middleware/Permitted';
import { Permission } from '@src/auth/permissions';
import { loaderResult } from '@src/utils/loaderResult';
import { UserInputError } from 'apollo-server-errors';
import { ObjectId } from 'mongoose';
import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from 'type-graphql';
import { ItemLoader, ItemModel } from '../Item/Item';
import { ObjectIdScalar } from '../ObjectIdScalar';
import {
    ItemCategory,
    ItemCategoryLoader,
    ItemCategoryModel,
} from './ItemCategory';

@Resolver(() => ItemCategory)
export class ItemCategoryResolvers {
    @UseMiddleware(Permitted())
    @Query(() => [ItemCategory])
    async itemCategories(): Promise<ItemCategory[]> {
        const res = await ItemCategoryModel.find({}).sort({ label: 1 });
        return res.map((doc) => doc.toJSON() as unknown as ItemCategory);
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateItem })
    )
    @Mutation(() => ItemCategory)
    async createItemCategory(
        @Ctx() context: Context,
        @Arg('label') label: string
    ): Promise<ItemCategory> {
        const category: ItemCategory = { ...context.base, label };
        const res = await ItemCategoryModel.create(category);
        return res.toJSON() as unknown as ItemCategory;
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateItem })
    )
    @Mutation(() => ItemCategory)
    async updateItemCategory(
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('label') label: string
    ): Promise<ItemCategory> {
        const doc = await ItemCategoryModel.findById(id.toString());
        if (!doc)
            throw new UserInputError(
                `Category with id ${id.toString()} does not exist.`
            );

        doc.label = label;
        await doc.save();

        ItemCategoryLoader.clear(id.toString());

        return loaderResult(await ItemCategoryLoader.load(id.toString()));
    }

    @UseMiddleware(
        Permitted({ type: 'permission', permission: Permission.CreateItem })
    )
    @Mutation(() => Boolean)
    async deleteItemCategory(
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<boolean> {
        await ItemCategoryModel.findByIdAndDelete(id.toString());
        const needsUpdate = await ItemModel.find({ category: id.toString() });
        await ItemModel.updateMany(
            {
                _id: { $in: needsUpdate.map((d) => d._id) },
            },
            { category: null }
        );
        ItemLoader.clearAll();
        ItemCategoryLoader.clearAll();
        return true;
    }
}

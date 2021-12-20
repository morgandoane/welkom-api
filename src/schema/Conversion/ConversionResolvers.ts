import { UserInputError } from 'apollo-server-errors';
import { Context } from '@src/auth/context';
import { Item, ItemLoader, ItemModel } from './../Item/Item';
import { ConversionInput } from './ConversionInput';
import { ObjectIdScalar } from '@src/schema/ObjectIdScalar';
import { Conversion } from './Conversion';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import { createBaseResolver } from './../Base/BaseResolvers';
import { ObjectId } from 'mongoose';

const BaseResolvers = createBaseResolver();

@Resolver(() => Conversion)
export class ConversionResolvers extends BaseResolvers {
    @Mutation(() => Conversion)
    async upsertConversion(
        @Ctx() { base }: Context,
        @Arg('item', () => ObjectIdScalar) id: ObjectId,
        @Arg('data', () => ConversionInput) data: ConversionInput
    ): Promise<Conversion> {
        const item = await ItemModel.findById(id);
        const match = item.conversions.find(
            (c) => c.from == data.from && c.to == data.to
        );
        const index = !match
            ? -1
            : item.conversions.map((c) => c._id).indexOf(match._id);

        if (index !== -1) {
            item.conversions.splice(index, 1);

            const replacement: Conversion = {
                ...base,
                ...data,
            };

            item.conversions.push(replacement);

            await item.save();

            ItemLoader.clear(item._id.toString());

            return replacement;
        } else {
            const conversion: Conversion = {
                ...base,
                ...data,
            };

            item.conversions.push(conversion);

            await item.save();

            ItemLoader.clear(item._id.toString());

            return conversion;
        }
    }

    @Mutation(() => Item)
    async deleteConversion(
        @Arg('id', () => ObjectIdScalar) id: ObjectId
    ): Promise<Item> {
        const item = await ItemModel.findOne({ 'conversions._id': id });
        if (!item)
            throw new UserInputError(
                'Failed to find item with id ' + id.toString()
            );

        item.conversions = item.conversions.filter(
            (c) => c._id.toString() !== id.toString()
        );

        ItemLoader.clear(item._id.toString());

        await item.save();

        return item.toJSON();
    }
}

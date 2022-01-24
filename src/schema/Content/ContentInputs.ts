import { UserInputError } from 'apollo-server-errors';
import { RecipeVersionModel } from './../RecipeVersion/RecipeVersion';
import { RecipeModel } from './../Recipe/Recipe';
import { mongoose } from '@typegoose/typegoose';
import { ProceduralLotContent } from './../Lot/extensions/ProceduralLot/ProceduralLot';
import { LocationLoader } from './../Location/Location';
import { ItemLoader } from './../Item/Item';
import { UnitLoader } from './../Unit/Unit';
import { loaderResult } from './../../utils/loaderResult';
import { ObjectId } from 'mongoose';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Field, InputType } from 'type-graphql';
import {
    Content,
    ItemContent,
    ItemPluralContent,
    LotContent,
    OrderContent,
} from './Content';
import { LotLoader } from '../Lot/Lot';
import { BucketLotContent } from '../Lot/extensions/BucketLot/BucketLot';

@InputType()
export class ContentInput {
    @Field()
    quantity!: number;

    @Field(() => ObjectIdScalar)
    unit!: ObjectId;

    async validateContent(): Promise<Content> {
        const unit = loaderResult(await UnitLoader.load(this.unit.toString()));
        return {
            quantity: this.quantity,
            unit: unit._id,
        };
    }
}

@InputType()
export class ItemContentInput extends ContentInput {
    @Field(() => ObjectIdScalar)
    item!: ObjectId;

    async validateItemContent(): Promise<ItemContent> {
        const content = await this.validateContent();
        const item = loaderResult(await ItemLoader.load(this.item.toString()));
        return {
            ...content,
            item: item._id,
        };
    }
}

@InputType()
export class ItemPluralContentInput extends ContentInput {
    @Field(() => [ObjectIdScalar])
    items!: ObjectId[];

    async validateItemPluralContent(): Promise<ItemPluralContent> {
        const content = await this.validateContent();
        const items = await ItemLoader.loadMany(
            this.items.map((i) => i.toString())
        );

        return {
            ...content,
            items: items.map((i) => loaderResult(i)._id),
        };
    }
}

@InputType()
export class OrderContentInput extends ItemContentInput {
    @Field(() => ObjectIdScalar)
    location!: ObjectId;

    @Field()
    due!: Date;

    async validateOrderContent(): Promise<OrderContent> {
        const itemContent = await this.validateItemContent();
        const location = loaderResult(
            await LocationLoader.load(this.location.toString())
        );
        return {
            ...itemContent,
            location: location._id,
            due: this.due,
        };
    }
}

@InputType()
export class LotContentInput extends ContentInput {
    @Field(() => ObjectIdScalar)
    lot!: ObjectId;

    async validateLotContent(): Promise<LotContent> {
        const content = await this.validateContent();
        const lot = loaderResult(await LotLoader.load(this.lot.toString()));
        return {
            ...content,
            lot: lot._id,
        };
    }
}

@InputType()
export class ProceduralLotContentInput extends LotContentInput {
    @Field({ nullable: true })
    recipe_step?: string;

    async validateProceduralLotContent(): Promise<ProceduralLotContent> {
        if (this.recipe_step) {
            return {
                ...(await this.validateLotContent()),
                recipe_step: new mongoose.Types.ObjectId(this.recipe_step),
            };
        } else {
            return {
                ...(await this.validateLotContent()),
            };
        }
    }
}

@InputType()
export class BucketLotContentInput extends LotContentInput {
    async validateBucketLotContent(): Promise<BucketLotContent> {
        const content = await this.validateLotContent();
        return {
            ...content,
        };
    }
}

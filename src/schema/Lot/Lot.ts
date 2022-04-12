import { ProductionLine } from './../ProductionLine/ProductionLine';
import { ExpenseSummary } from './../ExpenseSummary/ExpenseSummary';
import { Company } from '@src/schema/Company/Company';
import { Expensed } from './../Expensed/Expensed';
import {
    modelOptions,
    getModelForClass,
    prop,
    Ref,
    index,
} from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { Item } from '../Item/Item';
import { Min } from 'class-validator';
import { BaseUnit } from '../Unit/BaseUnit';
import { LotContent } from '../LotContent/LotContent';
import { getBaseLoader } from '@src/utils/baseLoader';
import { Location } from '../Location/Location';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'lots',
    },
})
// any given company cannot produce two lots of the same item with the same code.
@index({ company: 1, item: 1, code: 1 }, { unique: true })
export class Lot extends Expensed {
    @Field()
    @prop({ required: true })
    code!: string;

    @Field(() => Item)
    @prop({ required: true, ref: () => Item })
    item!: Ref<Item>;

    @Field(() => ProductionLine, { nullable: true })
    @prop({ required: false, ref: () => ProductionLine })
    production_line!: Ref<ProductionLine> | null;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    company!: Ref<Company>;

    @Field(() => Location, { nullable: true })
    @prop({ required: false, ref: () => Location })
    location!: Ref<Location> | null;

    @Field(() => [LotContent])
    @prop({ required: true, type: () => LotContent })
    contents!: LotContent[];

    @Min(0)
    @Field()
    @prop({ required: true, min: 0 })
    quantity!: number;

    // must match the BaseUnit of the item
    @Field(() => BaseUnit)
    @prop({ required: true, enum: BaseUnit })
    base_unit!: BaseUnit;

    @Field(() => [ExpenseSummary])
    @prop({ required: false, type: () => ExpenseSummary })
    expense_summaries!: ExpenseSummary[] | null;
}

export const LotModel = getModelForClass(Lot);
export const LotLoader = getBaseLoader(LotModel);

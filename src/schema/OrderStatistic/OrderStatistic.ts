import { UnitClass } from './../Unit/Unit';
import { Field, ObjectType } from 'type-graphql';
import { Item } from '../Item/Item';

@ObjectType()
export class OrderStatisticRangeQuantity {
    @Field(() => UnitClass)
    unit_class: UnitClass;

    @Field(() => Number)
    quantity: number;
}

@ObjectType()
export class OrderStatisticRange {
    @Field(() => Number)
    month: number;

    @Field(() => [OrderStatisticRangeQuantity])
    quantitys: OrderStatisticRangeQuantity[];
}

@ObjectType()
export class OrderStatistic {
    @Field(() => Item)
    item: Item;

    @Field(() => [OrderStatisticRange])
    ranges: OrderStatisticRange[];
}

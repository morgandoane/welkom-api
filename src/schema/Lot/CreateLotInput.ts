import {
    ProductionLine,
    ProductionLineLoader,
} from './../ProductionLine/ProductionLine';
import { ItemLoader } from '@src/schema/Item/Item';
import { LotContentInput } from './../LotContent/LotContentInput';
import { CompanyLoader } from '../Company/Company';
import { Context } from '../../auth/context';
import { Ref } from '@typegoose/typegoose';
import { Min } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Company } from '../Company/Company';
import { Lot } from './Lot';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Item } from '../Item/Item';
import { BaseUnit } from '../Unit/BaseUnit';
import { Location, LocationLoader } from '../Location/Location';
import { UserInputError } from 'apollo-server-core';

@InputType()
export class CreateLotInput {
    @Field()
    code!: string;

    @Field(() => ObjectIdScalar)
    item!: Ref<Item>;

    @Field(() => ObjectIdScalar)
    company!: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    location!: Ref<Location> | null;

    @Field(() => ObjectIdScalar, { nullable: true })
    production_line!: Ref<ProductionLine> | null;

    @Field(() => [LotContentInput])
    contents!: LotContentInput[];

    @Min(0)
    @Field()
    quantity!: number;

    // must match the BaseUnit of the item
    @Field(() => BaseUnit)
    base_unit!: BaseUnit;

    public async validateLot(context: Context): Promise<Lot> {
        const item = await ItemLoader.load(this.item, true);
        const company = await CompanyLoader.load(this.company, true);
        const location = this.location
            ? await LocationLoader.load(this.location, true)
            : null;

        const production_line = this.production_line
            ? await ProductionLineLoader.load(this.production_line, true)
            : null;

        if (item.base_unit !== this.base_unit)
            throw new UserInputError(
                'Base Unit must match that of the lots item'
            );

        const res: Lot = {
            ...context.base,
            ...this,
            contents: [],
            expense_summaries: null,
            expenses: [],
            production_line: production_line ? production_line._id : null,
            location: location ? location._id : null,
        };

        for (const content of this.contents) {
            res.contents.push(await content.validateLotContent());
        }

        return res;
    }
}

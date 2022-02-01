import {
    ProductionLine,
    ProductionLineLoader,
} from './../ProductionLine/ProductionLine';
import { CompanyLoader } from './../Company/Company';
import { ItemLoader } from '@src/schema/Item/Item';
import { LotContentInput } from './../LotContent/LotContentInput';
import { Ref } from '@typegoose/typegoose';
import { Min } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Company } from '../Company/Company';
import { Item } from '../Item/Item';
import { ObjectIdScalar } from '../ObjectIdScalar/ObjectIdScalar';
import { Lot } from './Lot';
import { LocationLoader } from '../Location/Location';

@InputType()
export class UpdateLotInput {
    @Field({ nullable: true })
    deleted?: boolean;

    @Field({ nullable: true })
    code?: string;

    @Field(() => ObjectIdScalar, { nullable: true })
    item?: Ref<Item>;

    @Field(() => ObjectIdScalar, { nullable: true })
    company?: Ref<Company>;

    @Field(() => ObjectIdScalar, { nullable: true })
    location?: Ref<Location> | null;

    @Field(() => ObjectIdScalar, { nullable: true })
    production_line?: Ref<ProductionLine> | null;

    @Field(() => [LotContentInput], { nullable: true })
    contents?: LotContentInput[];

    @Min(0)
    @Field({ nullable: true })
    quantity?: number;

    public async serializeLotUpdate(): Promise<Partial<Lot>> {
        const res: Partial<Lot> = {};

        if (this.deleted !== null && this.deleted !== undefined) {
            res.deleted = this.deleted;
        }
        if (this.code) res.code = this.code;
        if (this.item) {
            const item = await ItemLoader.load(this.item, true);
            res.item = item._id;
        }
        if (this.company) {
            const company = await CompanyLoader.load(this.company, true);
            res.company = company._id;
        }
        if (this.location == undefined) {
            if (!this.location) res.location = null;
            else {
                const location = await LocationLoader.load(this.location, true);
                res.location = location._id;
            }
        }
        if (this.production_line !== undefined) {
            if (!this.production_line) res.production_line = null;
            else {
                const production_line = await ProductionLineLoader.load(
                    this.production_line,
                    true
                );
                res.production_line = production_line._id;
            }
        }
        if (this.contents) {
            res.contents = [];

            for (const content of this.contents) {
                res.contents.push(await content.validateLotContent());
            }
        }
        if (this.quantity) res.quantity = this.quantity;

        return res;
    }
}

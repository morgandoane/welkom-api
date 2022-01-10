import { CompanyLoader } from './../Company/Company';
import { UnitLoader } from './../Unit/Unit';
import { loaderResult } from './../../utils/loaderResult';
import { Context } from '@src/auth/context';
import { Field, InputType } from 'type-graphql';
import { UnitClass } from '../Unit/Unit';
import { Item } from './Item';

@InputType()
export class CreateItemInput {
    @Field(() => UnitClass)
    unit_class!: UnitClass;

    @Field()
    english!: string;

    @Field()
    spanish!: string;

    @Field({ nullable: true })
    default_unit?: string;

    @Field({ nullable: true })
    default_vendor?: string;

    public async validateItemInput({ base }: Context): Promise<Partial<Item>> {
        const item: Item = {
            ...base,
            english: this.english,
            spanish: this.spanish,
            unit_class: this.unit_class,
            conversions: [],
        };

        if (this.default_unit) {
            const unit = loaderResult(await UnitLoader.load(this.default_unit));
            item.default_unit = unit._id;
        }
        if (this.default_vendor) {
            const vendor = loaderResult(
                await CompanyLoader.load(this.default_vendor)
            );
            item.default_vendor = vendor._id;
        }

        return item;
    }
}

@InputType()
export class UpdateItemInput {
    @Field({ nullable: true })
    english?: string;

    @Field({ nullable: true })
    spanish?: string;

    @Field({ nullable: true })
    deleted?: boolean;

    @Field({ nullable: true })
    default_unit?: string;

    @Field({ nullable: true })
    default_vendor?: string;

    @Field(() => UnitClass, { nullable: true })
    unit_class?: UnitClass;

    public async serializeItemUpdate({
        base,
    }: Context): Promise<Partial<Item>> {
        const item: Partial<Item> = {
            date_modified: base.date_modified,
            modified_by: base.modified_by,
        };

        if (this.english) item.english = this.english;
        if (this.spanish) item.spanish = this.spanish;
        if (this.unit_class) item.unit_class = this.unit_class;
        if (this.default_unit) {
            const unit = loaderResult(await UnitLoader.load(this.default_unit));
            item.default_unit = unit._id;
        }
        if (this.default_vendor) {
            const vendor = loaderResult(
                await CompanyLoader.load(this.default_vendor)
            );
            item.default_vendor = vendor._id;
        }
        if (this.deleted !== undefined) item.deleted = this.deleted;
        return item;
    }
}

import { UserInputError } from 'apollo-server-errors';
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
    to_base_unit!: number;

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
            to_base_unit: this.to_base_unit,
            conversions: [],
        };

        if (this.unit_class !== UnitClass.Volume && this.to_base_unit !== 1) {
            throw new UserInputError('Invalid to_base_unit');
        }

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

    @Field()
    to_base_unit?: number;

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

        if (this.unit_class || this.to_base_unit) {
            if (!this.unit_class || !this.to_base_unit) {
                throw new UserInputError(
                    'Plase update unit_class & to_base_unit at the same time.'
                );
            }
        }

        if (this.to_base_unit) {
            if (
                this.unit_class !== UnitClass.Volume &&
                this.to_base_unit !== 1
            ) {
                throw new UserInputError('Invalid to_base_unit');
            }
            item.to_base_unit = this.to_base_unit;
        }

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

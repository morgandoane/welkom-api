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
}

@InputType()
export class UpdateItemInput {
    @Field({ nullable: true })
    english?: string;

    @Field({ nullable: true })
    spanish?: string;

    @Field({ nullable: true })
    deleted?: boolean;

    public serializeItemUpdate({ base }: Context): Partial<Item> {
        const item: Partial<Item> = {
            date_modified: base.date_modified,
            modified_by: base.modified_by,
        };

        if (this.english) item.english = this.english;
        if (this.spanish) item.spanish = this.spanish;
        if (this.deleted !== undefined) item.deleted = this.deleted;
        return item;
    }
}

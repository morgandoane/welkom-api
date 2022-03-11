import { NamesInput } from './../Names/NamesInput';
import { prop } from '@typegoose/typegoose';
import { Field, InputType } from 'type-graphql';
import { Item } from './Item';

@InputType()
export class UpdateItemInput {
    @Field({ nullable: true })
    deleted?: boolean;

    @Field(() => NamesInput, { nullable: true })
    @prop({ required: true })
    names?: NamesInput;

    public async serializeItem(): Promise<Partial<Item>> {
        const res: Partial<Item> = {};

        if (this.deleted !== null && this.deleted !== undefined)
            res.deleted = this.deleted;

        if (this.names) res.names = this.names;

        return res;
    }
}

import { PalletConfigurationInput } from './../PalletConfiguration/PalletConfigurationInput';
import { NamesInput } from './../Names/NamesInput';
import { prop } from '@typegoose/typegoose';
import { MinLength } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { Item } from './Item';

@InputType()
export class UpdateItemInput {
    @Field({ nullable: true })
    deleted?: boolean;

    @Field(() => NamesInput, { nullable: true })
    @prop({ required: true })
    names?: NamesInput;

    @MinLength(1)
    @Field(() => [PalletConfigurationInput], { nullable: true })
    pallet_configurations?: PalletConfigurationInput[];

    public async serializeItem(): Promise<Partial<Item>> {
        const res: Partial<Item> = {};

        if (this.deleted !== null && this.deleted !== undefined)
            res.deleted = this.deleted;

        if (this.names) res.names = this.names;
        if (this.pallet_configurations)
            res.pallet_configurations = this.pallet_configurations;

        return res;
    }
}

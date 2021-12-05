import { FieldValueUnion } from '../Field/Field';
import { Configured } from '../Configured/Configured';
import { Unit } from '../Unit/Unit';
import { Item } from '../Item/Item';
import {
    getModelForClass,
    index,
    modelOptions,
    prop,
    Ref,
} from '@typegoose/typegoose';
import { Location } from '../Location/Location';
import { Company } from '../Company/Company';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
@index({ code: 1 })
@modelOptions({
    schemaOptions: {
        collection: 'lots',
    },
})
export class Lot extends Configured {
    @Field()
    @prop({ required: true })
    code!: string;

    @Field(() => Item)
    @prop({ required: true, ref: () => Item })
    item!: Ref<Item>;

    @Field(() => Location, { nullable: true })
    @prop({ required: false, ref: () => Location })
    location?: Ref<Location>;

    @Field(() => Company, { nullable: true })
    @prop({ required: false, ref: () => Company })
    company?: Ref<Company>;

    @Field(() => [FieldValueUnion])
    @prop({ required: true })
    field_values!: Array<typeof FieldValueUnion>;

    @Field(() => [LotContent])
    @prop({ required: true, type: () => LotContent })
    contents!: LotContent[];
}

@ObjectType()
export class LotContent {
    @Field(() => Item)
    @prop({ required: true, ref: () => Item })
    item!: Ref<Item>;

    @Field(() => Unit)
    @prop({ required: true, ref: () => Unit })
    unit!: Ref<Unit>;

    @Field()
    @prop({ required: true })
    quantity!: number;
}

export const LotModel = getModelForClass(Lot);

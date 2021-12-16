import { Base } from './../Base/Base';
import { getBaseLoader } from './../Loader';
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
import { LotContent } from '../Content/Content';

@ObjectType()
@index({ code: 1 })
@modelOptions({
    schemaOptions: {
        collection: 'lots',
    },
})
export class Lot extends Base {
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

    @Field(() => [LotContent])
    @prop({ required: true, type: () => LotContent })
    contents!: LotContent[];
}

export const LotModel = getModelForClass(Lot);

export const LotLoader = getBaseLoader(LotModel);

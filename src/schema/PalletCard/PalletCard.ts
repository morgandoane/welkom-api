import { prop, mongoose, getModelForClass, Ref } from '@typegoose/typegoose';
import { Field, ObjectType, ID } from 'type-graphql';
import Dataloader from 'dataloader';
import { Company } from '../Company/Company';
import { Location } from '../Location/Location';
import { Item } from '../Item/Item';
import { ProductionLine } from '../ProductionLine/ProductionLine';
import { LotContent } from '../Content/LotContent';
import { ObjectId } from 'mongoose';

@ObjectType()
export class PalletCard {
    @Field(() => ID)
    @prop({ required: true, type: () => mongoose.Types.ObjectId })
    _id: mongoose.Types.ObjectId;

    @Field()
    @prop({ required: true })
    profile!: string;

    @Field(() => [LotContent])
    @prop({ required: true, type: () => LotContent })
    contents!: LotContent[];

    @Field(() => Item)
    @prop({ required: true, ref: () => Item })
    item!: Ref<Item> | ObjectId;

    @Field(() => Company)
    @prop({ required: true, ref: () => Company })
    company!: Ref<Company> | ObjectId;

    @Field(() => Location)
    @prop({ required: true, ref: () => Location })
    location!: Ref<Location> | ObjectId;

    @Field({ nullable: true, defaultValue: false })
    @prop({ required: false })
    include_trays?: boolean;

    @Field(() => [ProductionLine])
    @prop({ required: true, ref: () => ProductionLine })
    production_lines!: Ref<ProductionLine>[];

    @Field()
    @prop({ required: true, default: false })
    closed!: boolean;
}

export const PalletCardModel = getModelForClass(PalletCard);

export const PalletCardProfileLoader = new Dataloader<string, PalletCard>(
    async function (keys: readonly string[]) {
        const matches = await PalletCardModel.find({
            profile: { $in: [...keys] },
            closed: false,
        });

        return keys.map(
            (k) =>
                matches.find((m) => m.profile == k) ||
                new Error(`Failed to get Pallet Card for ${k}`)
        );
    }
);

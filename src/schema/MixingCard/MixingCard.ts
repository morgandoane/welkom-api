import { ProductionLine } from './../ProductionLine/ProductionLine';
import { Base } from './../Base/Base';
import { Profile } from '../Profile/Profile';
import { Location } from '../Location/Location';
import { prop, Ref, getModelForClass } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import { MixingCardLine } from '../MixingCardLine/MixingCardLine';

@ObjectType()
export class MixingCard extends Base {
    @Field(() => Location)
    @prop({ required: true, ref: () => Location })
    location!: Ref<Location>;

    @Field(() => ProductionLine, { nullable: true })
    @prop({ required: false, ref: () => ProductionLine })
    production_line?: Ref<ProductionLine>;

    @Field(() => Profile)
    @prop({ required: true })
    profile!: string;

    @Field(() => [MixingCardLine])
    @prop({ required: true, type: () => MixingCardLine })
    lines!: MixingCardLine[];
}

export const MixingCardModel = getModelForClass(MixingCard);

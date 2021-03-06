import { Item } from '@src/schema/Item/Item';
import { getBaseLoader } from '@src/schema/Loader';
import {
    mongoose,
    prop,
    Ref,
    getModelForClass,
    modelOptions,
} from '@typegoose/typegoose';
import { Field, ID, ObjectType } from 'type-graphql';
import { Lot } from '../Lot/Lot';
import { Location } from '../Location/Location';
import { ObjectId } from 'mongoose';

@ObjectType()
@modelOptions({
    schemaOptions: {
        collection: 'trays',
    },
})
export class Tray {
    @Field(() => ID)
    @prop({ required: true, type: () => mongoose.Types.ObjectId })
    _id!: ObjectId;

    @Field()
    @prop({ required: true })
    date_created!: Date;

    @Field()
    @prop({ required: true, unique: true })
    code!: string;

    @Field({ nullable: true })
    @prop({ required: false })
    last_scan!: Date | null;

    @Field(() => String)
    @prop({ required: true, ref: () => Lot })
    location!: Ref<Location> | ObjectId;

    @Field(() => [Lot])
    @prop({ required: true, ref: () => Lot })
    lots!: (Ref<Lot> | ObjectId)[];

    // denormalized
    @Field(() => [String])
    @prop({ required: false, ref: () => Item })
    items?: (Ref<Item> | ObjectId)[];
}

export const TrayModel = getModelForClass(Tray);
export const TrayLoader = getBaseLoader(TrayModel);

import { Bol } from './../Bol/Bol';
import { LotModel } from './../Lot/Lot';
import { ItemLoader } from './../Item/Item';
import { CompanyLoader } from './../Company/Company';
import { DocumentType, mongoose, Ref } from '@typegoose/typegoose';
import { LocationLoader } from './../Location/Location';
import { loaderResult } from './../../utils/loaderResult';
import { Context } from './../../auth/context';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId, UpdateQuery } from 'mongoose';
import {
    ConfiguredInput,
    UpdateConfiguredInput,
} from './../Configured/ConfiguredInput';
import { Field, InputType } from 'type-graphql';
import { Fulfillment, FulfillmentType } from './Fulfillment';
import { Lot } from '../Lot/Lot';

@InputType()
export class FulfillmentInput extends ConfiguredInput {
    @Field(() => ObjectIdScalar)
    bol!: ObjectId;

    @Field(() => FulfillmentType)
    type!: FulfillmentType;

    @Field(() => [FulfillmentLotFinder])
    lots!: FulfillmentLotFinder[];

    @Field(() => ObjectIdScalar)
    location!: ObjectId;

    @Field(() => ObjectIdScalar)
    company!: ObjectId;

    public async validateFulfillment(context: Context): Promise<Fulfillment> {
        const configured = await this.validate(context);

        loaderResult(await LocationLoader.load(this.location.toString()));
        loaderResult(await CompanyLoader.load(this.company.toString()));

        const fulfillment: Fulfillment = {
            ...configured,
            bol: new mongoose.Types.ObjectId(this.bol.toString()),
            type: this.type,
            location: new mongoose.Types.ObjectId(this.location.toString()),
            company: new mongoose.Types.ObjectId(this.company.toString()),
            lots: [],
        };

        for (const lot of this.lots) {
            fulfillment.lots.push(await lot.execute(context));
        }

        return fulfillment;
    }
}

@InputType()
export class UpdateFulfillmentInput extends UpdateConfiguredInput {
    public async serializeFulfillmentUpdate(): Promise<
        UpdateQuery<Fulfillment>
    > {
        const update: UpdateQuery<DocumentType<Fulfillment>> = {
            ...(await this.serializeConfiguredUpdate()),
        };

        return update;
    }
}

@InputType()
export class FulfillmentLotFinder {
    @Field(() => ObjectIdScalar)
    item: ObjectId;

    @Field()
    code: string;

    @Field(() => ObjectIdScalar)
    company: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    location?: ObjectId;

    public async execute(context: Context): Promise<Lot> {
        const company = loaderResult(
            await CompanyLoader.load(this.company.toString())
        );
        const item = loaderResult(await ItemLoader.load(this.item.toString()));
        const location = !this.location
            ? undefined
            : loaderResult(await LocationLoader.load(this.location.toString()));

        const match = await LotModel.findOne({
            item: item._id,
            company: company._id,
            location: location ? location._id : undefined,
            code: this.code,
        });

        if (match) return match;
        else {
            const newLot: Lot = {
                ...context.base,
                code: this.code,
                item: item._id,
                company: company._id,
                field_values: [],
                contents: [],
            };

            const res = await LotModel.create(newLot);
            return res.toJSON();
        }
    }
}

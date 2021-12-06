import { Context } from './../../auth/context';
import { ConfiguredInput } from './../Configured/ConfiguredInput';
import { FulfillmentInput } from './../Fulfillment/FulfillmentInput';
import { ItemContentInput } from './../Content/ContentInputs';
import { LocationLoader } from './../Location/Location';
import { CompanyLoader } from './../Company/Company';
import { loaderResult } from './../../utils/loaderResult';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Field, InputType } from 'type-graphql';
import { ObjectId } from 'mongoose';
import { Bol, BolAppointment_Company, BolAppointment_Location } from './Bol';

export enum BolAppointmentType {
    Company = 'Company',
    Location = 'Location',
}

@InputType()
export class BolAppointmentInput {
    @Field(() => BolAppointmentType)
    type!: BolAppointmentType;

    @Field(() => ObjectIdScalar)
    target!: ObjectId;

    public async validate(): Promise<
        BolAppointment_Company | BolAppointment_Location
    > {
        if (this.type == BolAppointmentType.Company) {
            const company = loaderResult(
                await CompanyLoader.load(this.target.toString())
            );
            return {
                type: 'Company',
                company: company._id,
            };
        } else {
            const location = loaderResult(
                await LocationLoader.load(this.target.toString())
            );
            return {
                type: 'Location',
                location: location._id,
            };
        }
    }
}

@InputType()
export class CreateBolInput extends ConfiguredInput {
    @Field(() => BolAppointmentInput, { nullable: true })
    from?: BolAppointmentInput;

    @Field(() => BolAppointmentInput, { nullable: true })
    to?: BolAppointmentInput;

    @Field(() => [ItemContentInput], { nullable: true })
    contents?: ItemContentInput[];

    @Field(() => [FulfillmentInput])
    shipments!: FulfillmentInput[];

    @Field(() => [FulfillmentInput])
    receipts!: FulfillmentInput[];

    public async validateBol(context: Context): Promise<Bol> {
        const configured = await this.validate(context);

        const bol: Bol = {
            ...configured,
            shipments: [],
            receipts: [],
            contents: [],
        };

        if (this.from) {
            bol.from = await this.from.validate();
        }

        if (this.to) {
            bol.to = await this.to.validate();
        }

        if (this.contents) {
            for (const content of this.contents) {
                bol.contents.push(await content.validateItemContent());
            }
        }

        for (const shipment of this.shipments) {
            bol.shipments.push(await shipment.validateFulfillment(context));
        }

        for (const receipt of this.receipts) {
            bol.receipts.push(await receipt.validateFulfillment(context));
        }

        return bol;
    }
}

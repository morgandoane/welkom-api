import { loaderResult } from './../../utils/loaderResult';
import {
    Fulfillment,
    FulfillmentLoader,
    FulfillmentModel,
    FulfillmentType,
} from './../Fulfillment/Fulfillment';
import { Itinerary, ItineraryModel } from './../Itinerary/Itinerary';
import { UpdateBolInput } from './BolInput';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { LocationLoader } from './../Location/Location';
import { CompanyLoader } from './../Company/Company';
import { BolAppointmentType } from '@src/schema/Bol/BolInput';
import { Arg, FieldResolver, Mutation, Resolver, Root } from 'type-graphql';
import { createConfiguredResolver } from '../Configured/ConfiguredResolver';
import {
    Bol,
    BolAppointment,
    BolAppointment_Company,
    BolAppointment_Location,
} from './Bol';

const ConfiguredResolvers = createConfiguredResolver();

@Resolver(() => Bol)
export class BolResolvers extends ConfiguredResolvers {
    @Mutation(() => Itinerary)
    async updateBol(
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data') data: UpdateBolInput
    ): Promise<Itinerary> {
        const partialUpdate = await data.serializeBolUpdate();
        const set = {};
        for (const field in partialUpdate) {
            if (partialUpdate[field] !== undefined)
                set['bols.$.' + field] = partialUpdate[field];
        }

        return await ItineraryModel.findOneAndUpdate(
            { ['bols._id']: id.toString() },
            { $set: set }
        );
    }

    @FieldResolver(() => BolAppointment)
    async from(@Root() { from }: Bol): Promise<typeof BolAppointment> {
        if (!from) return null;
        switch (from.type) {
            case 'Company': {
                const res: BolAppointment_Company = {
                    type: BolAppointmentType.Company,
                    company: await CompanyLoader.load(from.company.toString()),
                };
                return res;
            }
            case 'Location': {
                const res: BolAppointment_Location = {
                    type: BolAppointmentType.Location,
                    location: await LocationLoader.load(
                        from.location.toString()
                    ),
                };
                return res;
            }
        }
    }

    @FieldResolver(() => BolAppointment)
    async to(@Root() { to }: Bol): Promise<typeof BolAppointment> {
        if (!to) return null;
        switch (to.type) {
            case 'Company': {
                const res: BolAppointment_Company = {
                    type: BolAppointmentType.Company,
                    company: await CompanyLoader.load(to.company.toString()),
                };
                return res;
            }
            case 'Location': {
                const res: BolAppointment_Location = {
                    type: BolAppointmentType.Location,
                    location: await LocationLoader.load(to.location.toString()),
                };
                return res;
            }
        }
    }

    @FieldResolver(() => [Fulfillment])
    async shipments(
        @Root() bol: Bol,
        @Arg('show_deleted', () => Boolean, { defaultValue: false })
        show_deleted: boolean
    ): Promise<Fulfillment[]> {
        return await FulfillmentModel.find({
            deleted: show_deleted ? undefined : false,
            bol: bol._id,
            type: FulfillmentType.Shipment,
        });
    }

    @FieldResolver(() => [Fulfillment])
    async receipts(
        @Root() bol: Bol,
        @Arg('show_deleted', () => Boolean, { defaultValue: false })
        show_deleted: boolean
    ): Promise<Fulfillment[]> {
        return await FulfillmentModel.find({
            deleted: show_deleted ? undefined : false,
            bol: bol._id,
            type: FulfillmentType.Receipt,
        });
    }
}

import { Context } from './../../auth/context';
import { createBaseResolver } from './../Base/BaseResolvers';
import {
    Fulfillment,
    FulfillmentModel,
    FulfillmentType,
} from './../Fulfillment/Fulfillment';
import { Itinerary, ItineraryModel } from './../Itinerary/Itinerary';
import { UpdateBolInput, CreateBolInput } from './BolInput';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { ObjectId } from 'mongoose';
import { LocationLoader } from './../Location/Location';
import { CompanyLoader } from './../Company/Company';
import { BolAppointmentType } from '@src/schema/Bol/BolInput';
import {
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Resolver,
    Root,
} from 'type-graphql';
import {
    Bol,
    BolAppointment,
    BolAppointment_Company,
    BolAppointment_Location,
    BolModel,
} from './Bol';

const BaseResolvers = createBaseResolver();

@Resolver(() => Bol)
export class BolResolvers extends BaseResolvers {
    @Mutation(() => Itinerary)
    async createBol(
        @Arg('data') data: CreateBolInput,
        @Ctx() context: Context
    ): Promise<Bol> {
        return await BolModel.create(await data.validateBol(context));
    }

    @Mutation(() => Itinerary)
    async updateBol(
        @Arg('id', () => ObjectIdScalar) id: ObjectId,
        @Arg('data') data: UpdateBolInput
    ): Promise<Bol> {
        return await BolModel.findByIdAndUpdate(
            id,
            await data.serializeBolUpdate(),
            { new: true }
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

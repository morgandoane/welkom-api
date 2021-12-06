import { LocationLoader } from './../Location/Location';
import { CompanyLoader } from './../Company/Company';
import { BolAppointmentType } from '@src/schema/Bol/BolInput';
import { FieldResolver, Resolver, Root } from 'type-graphql';
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

    // contents!: ItemContent[];
    // shipments!: Fulfillment[];
    // receipts!: Fulfillment[];
}

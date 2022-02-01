import { CompanyLoader } from './../Company/Company';
import { Company } from '@src/schema/Company/Company';
import { Appointment } from './Appointment';
import { FieldResolver, Resolver, Root } from 'type-graphql';
import { Location, LocationLoader } from '../Location/Location';

@Resolver(() => Appointment)
export class AppointmentResolvers {
    @FieldResolver(() => Company)
    async company(@Root() { company }: Appointment): Promise<Company> {
        return await CompanyLoader.load(company, true);
    }

    @FieldResolver(() => Location)
    async location(@Root() { location }: Appointment): Promise<Location> {
        if (!location) return null;
        return await LocationLoader.load(location, true);
    }
}

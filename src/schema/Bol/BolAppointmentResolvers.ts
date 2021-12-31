import { Location, LocationLoader } from './../Location/Location';
import { Company, CompanyLoader } from './../Company/Company';
import { BolAppointment } from './BolAppointment';
import { FieldResolver, Resolver, ResolverInterface, Root } from 'type-graphql';
import { loaderResult } from '@src/utils/loaderResult';

@Resolver(() => BolAppointment)
export class BolAppointmentResolvers
    implements ResolverInterface<BolAppointment>
{
    @FieldResolver(() => Company)
    async company(@Root() { company }: BolAppointment): Promise<Company> {
        return loaderResult(await CompanyLoader.load(company.toString()));
    }

    @FieldResolver(() => Location)
    async location(@Root() { location }: BolAppointment): Promise<Location> {
        if (!location) return null;
        return loaderResult(await LocationLoader.load(location.toString()));
    }
}

import { BolLoader } from './../Bol/Bol';
import { LocationLoader } from './../Location/Location';
import { CompanyLoader } from './../Company/Company';
import { Company } from '@src/schema/Company/Company';
import { FieldResolver, Resolver, Root } from 'type-graphql';
import {
    ItineraryScheduleStage,
    ItinerarySchedulePath,
} from './ItinerarySchedule';
import { Location } from '../Location/Location';
import { Bol } from '../Bol/Bol';

@Resolver(() => ItineraryScheduleStage)
export class ItineraryScheduleStageResolvers {
    @FieldResolver(() => Company)
    async company(
        @Root() { company }: ItineraryScheduleStage
    ): Promise<Company> {
        return await CompanyLoader.load(company, true);
    }

    @FieldResolver(() => Location, { nullable: true })
    async location(
        @Root() { location }: ItineraryScheduleStage
    ): Promise<Location> {
        if (!location) return null;
        return await LocationLoader.load(location, true);
    }
}

@Resolver(() => ItinerarySchedulePath)
export class ItinerarySchedulePathResolvers {
    @FieldResolver(() => Bol)
    async bol(@Root() { bol }: ItinerarySchedulePath): Promise<Bol> {
        return await BolLoader.load(bol, true);
    }
}

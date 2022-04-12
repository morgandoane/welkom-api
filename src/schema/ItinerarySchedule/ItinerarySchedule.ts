import { BolLoader, BolModel } from './../Bol/BolModel';
import { Ref } from '@typegoose/typegoose';
import { Company } from '@src/schema/Company/Company';
import { ObjectType, Field } from 'type-graphql';
import { Location } from '../Location/Location';
import { Bol } from '../Bol/Bol';
import { Itinerary } from '../Itinerary/Itinerary';
import { format } from 'date-fns';

@ObjectType()
export class ItineraryScheduleStage {
    @Field()
    index!: number;

    @Field()
    date!: Date;

    @Field(() => Company)
    company!: Ref<Company>;

    @Field(() => Location, { nullable: true })
    location!: Ref<Location> | null;
}

export enum ItineraryStopStatus {
    Pending = 'Pending',
    Complete = 'Complete',
    Warning = 'Warning',
}

@ObjectType()
export class ItinerarySchedulePath {
    @Field(() => Bol)
    bol!: Ref<Bol>;

    @Field()
    from_index: number;

    @Field()
    to_index!: number;
}

@ObjectType()
export class ItinerarySchedule {
    @Field(() => [ItineraryScheduleStage])
    stages!: ItineraryScheduleStage[];

    @Field(() => [ItinerarySchedulePath])
    paths!: ItinerarySchedulePath[];

    public static async fromItinerary(
        doc: Itinerary
    ): Promise<ItinerarySchedule> {
        const stages: ItineraryScheduleStage[] = [];
        const paths: ItinerarySchedulePath[] = [];

        const bols = await BolModel.find({
            deleted: false,
            itinerary: doc._id,
        });

        const fromAppointments = bols
            .map((b) => (b.deleted ? [] : [b.from]))
            .flat();

        const toAppointments = bols
            .map((b) => (b.deleted ? [] : [b.to]))
            .flat();

        const getDateKey = (val: string | Date) =>
            format(new Date(val), 'YYY_MMM_d');

        // keyed by location_date
        const schema: Record<string, ItineraryScheduleStage> = {};

        for (const apt of [...fromAppointments, ...toAppointments]) {
            const key =
                (apt.location || apt.company).toString() +
                '_' +
                getDateKey(apt.date);

            if (!schema[key]) {
                const dates = [
                    ...Object.values(schema).map((d) => d.date),
                    new Date(apt.date),
                ].sort((a: Date, b: Date) => {
                    return a.getTime() < b.getTime() ? 1 : -1;
                });

                const index = dates
                    .map((d) => getDateKey(d))
                    .indexOf(getDateKey(new Date(apt.date)));

                schema[key] = {
                    index,
                    date: new Date(apt.date),
                    company: apt.company,
                    location: apt.location,
                };
            }
        }

        Object.entries(schema).map(([key, stage]) => {
            stages.push(stage);
        });

        const dates = [...Object.values(schema).map((d) => d.date)].sort(
            (a: Date, b: Date) => {
                return a.getTime() < b.getTime() ? 1 : -1;
            }
        );

        for (const bol of bols) {
            if (!bol.deleted) {
                paths.push({
                    bol: bol._id,
                    from_index: dates
                        .map((d) => getDateKey(d))
                        .indexOf(getDateKey(bol.from.date)),
                    to_index: dates
                        .map((d) => getDateKey(d))
                        .indexOf(getDateKey(bol.to.date)),
                });
            }
        }

        return {
            stages,
            paths,
        };
    }
}

import { Context } from './../../auth/context';
import { ItemContentInput } from './../Content/ContentInputs';
import { Field, InputType } from 'type-graphql';
import { Bol, BolStatus } from './Bol';
import { BolAppointmentInput } from './BolAppointment';
import { loaderResult } from '@src/utils/loaderResult';
import { ItineraryLoader } from '../Itinerary/Itinerary';

@InputType()
export class CreateBolInput {
    @Field()
    itinerary!: string;

    @Field()
    code!: string;

    @Field(() => BolAppointmentInput)
    from!: BolAppointmentInput;

    @Field(() => BolAppointmentInput)
    to!: BolAppointmentInput;

    @Field(() => [ItemContentInput])
    contents: ItemContentInput[];

    public async validateBol(context: Context): Promise<Bol> {
        const itinerary = loaderResult(
            await ItineraryLoader.load(this.itinerary)
        );

        const bol: Bol = {
            ...context.base,
            code: this.code,
            status: BolStatus.Pending,
            itinerary: itinerary._id,
            contents: [],
            from: await this.from.validateAppointment(),
            to: await this.to.validateAppointment(),
        };

        for (const content of this.contents) {
            bol.contents.push({
                ...(await content.validateItemContent()),
                fulfillment_percentage: 0,
            });
        }

        return bol;
    }
}

@InputType()
export class UpdateBolInput {
    @Field({ nullable: false })
    code?: string;

    @Field(() => BolAppointmentInput, { nullable: true })
    from?: BolAppointmentInput;

    @Field(() => BolAppointmentInput, { nullable: true })
    to?: BolAppointmentInput;

    @Field(() => [ItemContentInput], { nullable: true })
    contents?: ItemContentInput[];

    @Field({ nullable: true })
    deleted?: boolean;

    public async serializeBolUpdate(): Promise<Partial<Bol>> {
        const bolUpdate: Partial<Bol> = {};

        if (this.code) bolUpdate.code = this.code;

        if (this.deleted !== undefined && this.deleted !== null)
            bolUpdate.deleted = this.deleted;

        if (this.from) bolUpdate.from = await this.from.validateAppointment();

        if (this.to) bolUpdate.to = await this.to.validateAppointment();

        if (this.contents) {
            bolUpdate.contents = [];
            for (const content of this.contents) {
                bolUpdate.contents.push({
                    ...(await content.validateItemContent()),
                    fulfillment_percentage: 0,
                });
            }
        }

        return bolUpdate;
    }
}

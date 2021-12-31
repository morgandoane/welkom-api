import { BaseFilter } from './../Base/BaseFilter';
import { DateRangeInput } from './../DateRange/DateRangeInput';
import { ObjectIdScalar } from './../ObjectIdScalar';
import { Itinerary } from './Itinerary';
import { Field, InputType } from 'type-graphql';
import { DocumentType, mongoose } from '@typegoose/typegoose';
import { FilterQuery, ObjectId } from 'mongoose';
import { endOfDay, startOfDay } from 'date-fns';

@InputType()
export class ItineraryFilter extends BaseFilter {
    @Field(() => ObjectIdScalar, { nullable: true })
    item?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    order?: ObjectId;

    @Field(() => ObjectIdScalar, { nullable: true })
    location?: ObjectId;

    @Field(() => DateRangeInput, { nullable: true })
    stop_date?: DateRangeInput;

    public serializeItineraryFilter(): FilterQuery<DocumentType<Itinerary>> {
        const query = this.serializeBaseFilter() as FilterQuery<
            DocumentType<Itinerary>
        >;

        if (this.item) {
            query['bols.content.item'] = this.item;
        }

        if (this.location) {
            query.$or = [
                ...query.$or,
                { ['bols.from.location']: this.item },
                { ['bols.to.location']: this.item },
            ];
        }

        if (this.stop_date) {
            query.$or = [
                ...query.$or,
                {
                    ['bols.from.date']: {
                        $gte: startOfDay(this.stop_date.start),
                        $lte: endOfDay(this.stop_date.end),
                    },
                },
                {
                    ['bols.to.date']: {
                        $gte: startOfDay(this.stop_date.start),
                        $lte: endOfDay(this.stop_date.end),
                    },
                },
            ];
        }

        if (this.order) {
            query.orders = new mongoose.Types.ObjectId(this.order.toString());
        }

        return query;
    }
}

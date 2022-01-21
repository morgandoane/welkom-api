import { ModelType, DocumentType } from '@typegoose/typegoose/lib/types';
import { FilterQuery } from 'mongoose';
import { Field, ObjectType } from 'type-graphql';

export interface DateGroupArg<T> {
    model: ModelType<DocumentType<T>>;
    query: FilterQuery<T>;
    date_path: string;
}

export interface DateGroupResult {
    year: number;
    month: number;
    count: number;
}

@ObjectType()
export class DateGroup {
    @Field()
    year: number;

    @Field()
    month: number;

    @Field()
    count: number;

    public static execute = async <T>({
        model,
        query,
        date_path,
    }: DateGroupArg<T>): Promise<DateGroupResult[]> => {
        const res: DateGroupResult[] = await model.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        year: {
                            $year: `$${date_path}`,
                        },
                        month: {
                            $month: `$${date_path}`,
                        },
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    count: '$count',
                    month: '$_id.month',
                    year: '$_id.year',
                },
            },
        ]);

        return res;
    };
}

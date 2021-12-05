import { DocumentType, ModelType } from '@typegoose/typegoose/lib/types';
import { FilterQuery } from 'mongoose';

export interface _PaginateArg<T> {
    model: ModelType<DocumentType<T>>;
    query: FilterQuery<DocumentType<T>>;
    sort: Partial<Record<keyof T, -1 | 1>>;
    skip: number;
    take: number;
}

export interface PaginationResult<T> {
    items: T[];
    count: number;
}

export class Paginate {
    public static paginate = async <T>({
        model,
        query,
        sort,
        skip,
        take,
    }: _PaginateArg<T>): Promise<PaginationResult<T>> => {
        const res = await model.aggregate([
            { $sort: sort },
            { $match: query },
            {
                $facet: {
                    stage1: [{ $group: { _id: null, count: { $sum: 1 } } }],
                    stage2: [{ $skip: skip }, { $limit: take }],
                },
            },
            {
                $unwind: {
                    path: '$stage1',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    count: '$stage1.count',
                    data: '$stage2',
                },
            },
        ]);

        return {
            items: res[0].data,
            count: res[0].count || 0,
        };
    };
}

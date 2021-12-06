import { DocumentType, mongoose } from '@typegoose/typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import DataLoader from 'dataloader';
import { ObjectId } from 'mongoose';

export const getBaseLoader = <
    T extends { _id: ObjectId | mongoose.Types.ObjectId | string }
>(
    Model: ModelType<DocumentType<T>>
): DataLoader<string, DocumentType<T>> =>
    new DataLoader<string, DocumentType<T>>(async function (
        keys: readonly string[]
    ): Promise<(DocumentType<T> | Error)[]> {
        const res = await Model.find({
            _id: {
                $in: [...keys.map((key) => new mongoose.Types.ObjectId(key))],
            },
        } as any);
        return keys.map(
            (key) =>
                [...res].find((r) => r._id.toString() === key) ||
                new Error('Failed to find item with id ' + key)
        );
    });

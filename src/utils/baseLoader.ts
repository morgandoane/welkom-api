import { loaderResult } from './loaderResult';
import { DocumentType, mongoose } from '@typegoose/typegoose';
import { ModelType, Ref } from '@typegoose/typegoose/lib/types';
import DataLoader from 'dataloader';

export class AppDataLoader<
    T extends { _id: mongoose.Types.ObjectId | string }
> {
    private _loader: DataLoader<string, DocumentType<T>>;

    constructor(Model: ModelType<DocumentType<T>>) {
        this._loader = new DataLoader<string, DocumentType<T>>(async function (
            keys: readonly string[],
            strict = false
        ): Promise<(DocumentType<T> | Error)[]> {
            const res = await Model.find({
                _id: {
                    $in: [
                        ...keys.map((key) => new mongoose.Types.ObjectId(key)),
                    ],
                },
            } as any);
            return keys.map(
                (key) =>
                    [...res.map((d) => d.toJSON())].find(
                        (r) =>
                            (r._id as mongoose.Types.ObjectId).toString() ===
                            key
                    ) || new Error('Failed to find item with id ' + key)
            ) as (DocumentType<T> | Error)[];
        });
    }

    public async load<Strict extends boolean | undefined>(
        key: string | mongoose.Types.ObjectId | Ref<unknown>,
        strict?: Strict
    ): Promise<
        Strict extends true ? DocumentType<T> : DocumentType<T> | Error
    > {
        const res = await this._loader.load(key.toString());
        if (strict) return loaderResult(res);
        else return res;
    }

    public async loadMany<Strict extends boolean | undefined>(
        keys: (string | mongoose.Types.ObjectId | Ref<unknown>)[],
        strict?: Strict
    ): Promise<
        Strict extends true ? DocumentType<T>[] : (DocumentType<T> | Error)[]
    > {
        const res = await this._loader.loadMany(
            keys.map((key) => key.toString())
        );
        if (strict == true) return res.map((d) => loaderResult(d));
        else return res as any;
    }

    public clear(key: string | mongoose.Types.ObjectId | Ref<unknown>): void {
        this._loader.clear(key.toString());
    }

    public clearAll(): void {
        this._loader.clearAll();
    }
}

export const getBaseLoader = <
    T extends { _id: mongoose.Types.ObjectId | string }
>(
    Model: ModelType<DocumentType<T>>
): AppDataLoader<T> => new AppDataLoader(Model);

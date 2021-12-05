import DataLoader from 'dataloader';
import { DocumentType, mongoose } from '@typegoose/typegoose';
import { BeAnObject, ModelType } from '@typegoose/typegoose/lib/types';
import { CompanyModel } from './Company/Company';
import { ConfigModel } from './Config/Config';
import { ExpenseModel } from './Expense/Expense';
import { ItemModel } from './Item/Item';
import { ItineraryModel } from './Itinerary/Itinerary';
import { LocationModel } from './Location/Location';
import { BucketLotModel } from './Lot/extensions/BucketLot';
import { RecipeLotModel } from './Lot/extensions/RecipeLot';
import { LotModel } from './Lot/Lot';
import { OrderModel } from './Order/Order';
import { ProcedureModel } from './Procedure/Procedure';
import { ProcedureResponseModel } from './ProcedureResponse/ProcedureResponse';
import { RecipeModel } from './Recipe/Recipe';
import { UnitModel } from './Unit/Unit';
import { UserModel } from './User/User';
import { FilterQuery } from 'mongoose';

export const getLoader = <T>(
    model: ModelType<T>,
    field = '_id'
): DataLoader<string, DocumentType<T>> =>
    new DataLoader(async function load(
        keys: readonly string[]
    ): Promise<(Error | DocumentType<T>)[]> {
        const query = {
            [field]: {
                $in: keys.map((k) => new mongoose.Types.ObjectId(k)),
            },
        } as FilterQuery<DocumentType<T, BeAnObject>>;

        console.log(query);

        const docs = await model.find(query);

        return keys.map((key) => {
            return (
                docs.find((doc) => keys.includes(doc[field].toString())) ||
                new Error('nope!')
            );
        });
    });

export const Loader = {
    Company: getLoader(CompanyModel),
    Config: getLoader(ConfigModel),
    Expense: getLoader(ExpenseModel),
    Item: getLoader(ItemModel),
    Itinerary: getLoader(ItineraryModel),
    Location: getLoader(LocationModel),
    Lot: getLoader(LotModel),
    BucketLot: getLoader(BucketLotModel),
    RecipeLot: getLoader(RecipeLotModel),
    Order: getLoader(OrderModel),
    Procedure: getLoader(ProcedureModel),
    ProcedureResponse: getLoader(ProcedureResponseModel),
    Recipe: getLoader(RecipeModel),
    Unit: getLoader(UnitModel),
    User: getLoader(UserModel),
};

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

export const Mongo = {
    Company: CompanyModel,
    Config: ConfigModel,
    Expense: ExpenseModel,
    Item: ItemModel,
    Itinerary: ItineraryModel,
    Location: LocationModel,
    Lot: LotModel,
    BucketLot: BucketLotModel,
    RecipeLot: RecipeLotModel,
    Order: OrderModel,
    Procedure: ProcedureModel,
    ProcedureResponse: ProcedureResponseModel,
    Recipe: RecipeModel,
    Unit: UnitModel,
    User: UserModel,
};

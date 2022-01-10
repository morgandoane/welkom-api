import { FulfillmentModel } from './../schema/Fulfillment/Fulfillment';
import { UnitModel } from './../schema/Unit/Unit';
import { LocationModel } from './../schema/Location/Location';
import { ItemModel } from './../schema/Item/Item';
import { CompanyModel } from './../schema/Company/Company';
import { LegacyItemReceiptModel } from '@src/legacy/itemreceipt';
import { OrderModel } from './../schema/Order/Order';
import { Context } from '@src/auth/context';
import { LegacyUnit, LegacyUnitModel, LegacyUnitLoader } from './unit';
import { LegacyPlant, LegacyPlantModel, LegacyPlantLoader } from './plant';
import { env } from '@src/config';
import { createConnection } from './legacyConnection';
import {
    modelOptions,
    prop,
    getModelForClass,
    Ref,
    DocumentType,
    mongoose,
} from '@typegoose/typegoose';
import { LegacyItemReceipt, upsertUser } from './itemreceipt';
import {
    LegacySupplier,
    LegacySupplierModel,
    LegacySupplierLoader,
} from './supplier';
import { LegacyUser, LegacyUserModel, LegacyUserLoader } from './user';
import { LegacyItem, LegacyItemModel, LegacyItemLoader } from './item';
import { Order } from '@src/schema/Order/Order';
import { OrderContent } from '@src/schema/Content/Content';
import { BolModel } from '@src/schema/Bol/Bol';

const connection = createConnection(env.LEGACY_ATLAS_URL);

export class LegacyDestination {
    @prop({ required: true, ref: 'LegacyPlant' })
    destinationPlant: Ref<LegacyPlant>;

    @prop({ required: true })
    quantity: number;

    @prop({ required: true, ref: 'LegacyUnit' })
    unitContainer: Ref<LegacyUnit>;
}

@modelOptions({
    schemaOptions: {
        collection: 'itemorders',
    },
    existingConnection: connection,
})
export class LegacyItemOrder {
    @prop({ required: true })
    po: string;

    @prop({ required: true })
    item: Ref<LegacyItem>;

    @prop({ required: true })
    supplier: Ref<LegacySupplier>;

    @prop({ required: true })
    orderedBy: Ref<LegacyUser>;

    @prop({ required: true })
    orderDate: Date;

    @prop({ required: true })
    destinations: LegacyDestination[];

    @prop({ required: true })
    expectedDeliveryDate: Date;

    @prop({ required: true })
    requireTime: boolean;

    @prop({ required: true })
    actualDeliveryDate: Date;

    @prop({ required: true })
    receipts: Ref<LegacyItemReceipt>[];

    @prop({ required: true })
    status: {
        type: string;
        enum: ['pending', 'ordered', 'delivered', 'canceled'];
        required: true;
    };

    @prop({ required: true })
    requireManagerApproval: { type: boolean; default: false };

    @prop({ required: true })
    managerApproval: { type: boolean; default: false };

    public async transfer(context: Context): Promise<DocumentType<Order>> {
        const legacyUser = await LegacyUserModel.findById(
            this.orderedBy.toString()
        );
        const legacySupplier = await LegacySupplierModel.findById(
            this.supplier.toString()
        );
        const legacyItem = await LegacyItemModel.findById(this.item.toString());
        const created_by = await upsertUser(
            context,
            await legacyUser.convert('Wasatch1!')
        );

        const convertedVendor = await legacySupplier.convert(context);
        const convertedItem = await legacyItem.convert();

        const { _id, ...update } = context.base;

        const vendor = await CompanyModel.findOneAndUpdate(
            { name: convertedVendor.name },
            { ...update, name: convertedVendor.name },
            { new: true, upsert: true }
        );

        const item = await ItemModel.findOneAndUpdate(
            { english: convertedItem.english },
            { ...update, ...convertedItem },
            { new: true, upsert: true }
        );

        const contents: OrderContent[] = [];

        for (const { destinationPlant, quantity, unitContainer } of this
            .destinations) {
            const legacyLocation = await LegacyPlantModel.findById(
                destinationPlant.toString()
            );

            const legacyUnit = await LegacyUnitModel.findById(
                unitContainer.toString()
            );

            const location = await LocationModel.findOneAndUpdate(
                { label: legacyLocation.name },
                {
                    ...update,
                    ...(await legacyLocation.convert(
                        new mongoose.Types.ObjectId('61dabad64b8beb4274a3f292')
                    )),
                },
                { new: true, upsert: true }
            );

            const unit = await UnitModel.findOneAndUpdate(
                { english: legacyUnit.englishName },
                {
                    ...update,
                    ...(await legacyUnit.convert()),
                },
                { new: true, upsert: true }
            );

            contents.push({
                quantity,
                location: location._id,
                unit: unit._id,
                item: item._id,
                due: this.expectedDeliveryDate,
            });
        }

        const order: Order = {
            _id: new mongoose.Types.ObjectId(),
            date_created: this.orderDate,
            date_modified: this.orderDate,
            created_by: created_by.user_id,
            modified_by: created_by.user_id,
            code: this.po,
            contents,
            deleted: false,
            customer: new mongoose.Types.ObjectId('61dabad64b8beb4274a3f292'),
            vendor: vendor._id,
        };

        const orderDoc = await OrderModel.create(order);

        for (const receipt of this.receipts) {
            const legacyReceipt = await LegacyItemReceiptModel.findById(
                receipt
            );

            const res = await legacyReceipt.convert(orderDoc, context);

            const fulfillment = await res.validateFulfillment(context);

            const doc = await FulfillmentModel.create(fulfillment);

            await BolModel.findOneAndUpdate(
                { _id: doc.bol.toString() },
                { date_modified: new Date() }
            );
        }

        return orderDoc;
    }
}

export const LegacyItemOrderModel = getModelForClass(LegacyItemOrder);

import { Bol } from './Bol';
import { DocumentType } from '@typegoose/typegoose';
import { FulfillmentModel, FulfillmentType } from '../Fulfillment/Fulfillment';
import { BolStatus } from './BolStatus';

export const setBolStatus = async (
    bol: DocumentType<Bol>
): Promise<BolStatus> => {
    const fulfillments = await FulfillmentModel.find({ bol: bol._id });
    const shipments = fulfillments.filter(
        (f) => !f.deleted && f.type === FulfillmentType.Shipment
    );
    const receipts = fulfillments.filter(
        (f) => !f.deleted && f.type === FulfillmentType.Receipt
    );
    if (shipments.length > 0 && receipts.length > 0) return BolStatus.Complete;
    else if (shipments.length > 0) return BolStatus.InProgress;
    else return BolStatus.Pending;
};

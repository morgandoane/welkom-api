import { ItineraryStatus } from '@src/schema/Itinerary/ItineraryStatus';
import { BolModel } from '../Bol/BolModel';
import { BolStatus } from '../Bol/BolStatus';
import { CompanyModel } from '../Company/Company';
import { Itinerary } from './Itinerary';
import { DocumentType } from '@typegoose/typegoose';

export const setItineraryStatus = async (
    itin: DocumentType<Itinerary>
): Promise<ItineraryStatus> => {
    const bols = await BolModel.find({
        itinerary: itin._id,
        deleted: false,
    });

    const internalCompany = await CompanyModel.findOne({ internal: true });

    if (
        (!itin.code || !itin.carrier) &&
        bols.some(
            (b) => b.from.company.toString() == internalCompany._id.toString()
        )
    ) {
        return ItineraryStatus.Incomplete;
    } else {
        return bols.every((bol) => bol.status === BolStatus.Complete)
            ? ItineraryStatus.Complete
            : bols.some((bol) => bol.status === BolStatus.InProgress)
            ? ItineraryStatus.InProgress
            : ItineraryStatus.Pending;
    }
};

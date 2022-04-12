import { ItineraryModel } from '../Itinerary/Itinerary';
import { DocumentType, mongoose } from '@typegoose/typegoose';

export const projectBolStatus = async (
    itinerary_id: string | mongoose.Types.ObjectId
): Promise<void> => {
    const itinerary = await ItineraryModel.findById(itinerary_id);
    await itinerary.save();
};

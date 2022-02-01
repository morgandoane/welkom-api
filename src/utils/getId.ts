import mongoose from 'mongoose';

export const getId = (): { _id: mongoose.Types.ObjectId } => ({
    _id: new mongoose.Types.ObjectId(),
});

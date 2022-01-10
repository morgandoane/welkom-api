import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

export const createConnection = (
    name: string
): mongoose.Connection & Promise<mongoose.Connection> => {
    return mongoose.createConnection(name, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    });
};

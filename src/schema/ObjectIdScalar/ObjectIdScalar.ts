import { GraphQLScalarType, Kind } from 'graphql';
import { Types } from 'mongoose';

export const ObjectIdScalar = new GraphQLScalarType({
    name: 'ObjectId',
    description: 'Mongo object id scalar type',
    serialize(value: unknown): string {
        // check the type of received value
        if (
            !(value instanceof Types.ObjectId) ||
            new Types.ObjectId(value.toString()).toString() !== value.toString()
        ) {
            throw new Error(
                'ObjectIdScalar can only serialize ObjectId values'
            );
        }
        return value.toString();
    },
    parseValue(value: unknown): Types.ObjectId {
        // check the type of received value
        if (typeof value !== 'string') {
            throw new Error('ObjectIdScalar can only parse string values');
        }
        return new Types.ObjectId(value); // value from the client input variables
    },
    parseLiteral(ast): Types.ObjectId {
        // check the type of received value
        if (ast.kind !== Kind.STRING) {
            throw new Error('ObjectIdScalar can only parse string values');
        }
        return new Types.ObjectId(ast.value); // value from the client query
    },
});

import { Fulfillment } from './Fulfillment';
import { Pagination } from './../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class FulfillmentList extends Pagination(Fulfillment) {}

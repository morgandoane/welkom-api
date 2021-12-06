import { Order } from './Order';
import { Pagination } from './../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class OrderList extends Pagination(Order) {}

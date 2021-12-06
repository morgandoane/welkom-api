import { ItemClass } from './ItemClass';
import { Pagination } from './../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class ItemClassList extends Pagination(ItemClass) {}

import { Item } from './Item';
import { ObjectType } from 'type-graphql';
import { Pagination } from '../Pagination/Pagination';

@ObjectType()
export class ItemList extends Pagination(Item) {}

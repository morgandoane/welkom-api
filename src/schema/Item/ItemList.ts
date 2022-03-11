import { Item } from './Item';
import { Pagination } from '../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class ItemList extends Pagination(Item) {}

import { Lot } from './Lot';
import { Pagination } from '../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class LotList extends Pagination(Lot) {}

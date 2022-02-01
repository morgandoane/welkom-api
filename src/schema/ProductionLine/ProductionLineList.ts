import { ProductionLine } from './ProductionLine';
import { Pagination } from '../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class ProductionLineList extends Pagination(ProductionLine) {}

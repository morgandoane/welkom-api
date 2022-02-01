import { Product } from './Product';
import { Pagination } from '../../../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class ProductList extends Pagination(Product) {}

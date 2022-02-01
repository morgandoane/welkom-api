import { Bol } from './Bol';
import { Pagination } from '../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class BolList extends Pagination(Bol) {}

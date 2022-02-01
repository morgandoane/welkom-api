import { Unit } from './Unit';
import { Pagination } from '../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class UnitList extends Pagination(Unit) {}

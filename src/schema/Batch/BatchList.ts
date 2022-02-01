import { Batch } from './Batch';
import { Pagination } from './../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class BatchList extends Pagination(Batch) {}

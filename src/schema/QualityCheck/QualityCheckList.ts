import { Pagination } from '@src/schema/Pagination/Pagination';
import { ObjectType } from 'type-graphql';
import { QualityCheck } from './QualityCheck';

@ObjectType()
export class QualityCheckList extends Pagination(QualityCheck) {}

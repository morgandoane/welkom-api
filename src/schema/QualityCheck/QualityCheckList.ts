import { QualityCheck } from './QualityCheck';
import { Pagination } from '../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class QualityCheckList extends Pagination(QualityCheck) {}

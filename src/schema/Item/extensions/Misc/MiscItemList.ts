import { MiscItem } from './MiscItem';
import { Pagination } from '../../../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class MiscItemList extends Pagination(MiscItem) {}

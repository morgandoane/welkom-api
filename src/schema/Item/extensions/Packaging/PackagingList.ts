import { Packaging } from './Packaging';
import { Pagination } from '../../../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class PackagingList extends Pagination(Packaging) {}

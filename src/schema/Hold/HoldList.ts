import { Hold } from './Hold';
import { Pagination } from '../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class HoldList extends Pagination(Hold) {}

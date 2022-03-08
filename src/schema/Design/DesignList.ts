import { Design } from './Design';
import { Pagination } from '../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class DesignList extends Pagination(Design) {}

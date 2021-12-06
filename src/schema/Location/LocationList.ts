import { Location } from './Location';
import { Pagination } from './../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class LocationList extends Pagination(Location) {}

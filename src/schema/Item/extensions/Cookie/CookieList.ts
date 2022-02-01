import { Cookie } from './Cookie';
import { Pagination } from './../../../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class CookieList extends Pagination(Cookie) {}

import { Config } from './Config';
import { Pagination } from './../Pagination/Pagination';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class ConfigList extends Pagination(Config) {}

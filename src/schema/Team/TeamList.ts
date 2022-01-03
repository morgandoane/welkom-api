import { Team } from './Team';
import { Pagination } from '@src/schema/Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class TeamList extends Pagination(Team) {}

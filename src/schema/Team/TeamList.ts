import { Team } from './Team';
import { Pagination } from '../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class TeamList extends Pagination(Team) {}

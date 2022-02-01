import { Profile } from './Profile';
import { Pagination } from '../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class ProfileList extends Pagination(Profile) {}

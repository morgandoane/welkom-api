import { Profile } from './Profile';
import { Pagination } from '@src/schema/Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class ProfileList extends Pagination(Profile) {}

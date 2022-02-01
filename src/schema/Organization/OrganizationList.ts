import { Organization } from './Organization';
import { Pagination } from '../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class OrganizationList extends Pagination(Organization) {}

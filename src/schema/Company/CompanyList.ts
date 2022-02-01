import { Company } from './Company';
import { Pagination } from '../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class CompanyList extends Pagination(Company) {}

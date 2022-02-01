import { Expense } from './Expense';
import { Pagination } from '../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class ExpenseList extends Pagination(Expense) {}

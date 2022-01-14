import { Pagination } from './../Pagination/Pagination';
import { ObjectType } from 'type-graphql';
import { Expense } from './Expense';

@ObjectType()
export class ExpenseList extends Pagination(Expense) {}

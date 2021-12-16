import { Contact } from './Contact';
import { Pagination } from './../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class ContactList extends Pagination(Contact) {}

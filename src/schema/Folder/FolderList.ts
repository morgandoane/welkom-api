import { Pagination } from './../Pagination/Pagination';
import { ObjectType } from 'type-graphql';
import { Folder } from './Folder';

@ObjectType()
export class FolderList extends Pagination(Folder) {}

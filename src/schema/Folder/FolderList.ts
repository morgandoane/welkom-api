import { Folder } from './Folder';
import { Pagination } from '../Pagination/Pagination';
import { ObjectType } from 'type-graphql';

@ObjectType()
export class FolderList extends Pagination(Folder) {}

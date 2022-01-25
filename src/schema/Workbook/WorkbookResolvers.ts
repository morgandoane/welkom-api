import {
    AppStorage,
    StorageBucket,
} from './../../services/CloudStorage/CloudStorage';
import { Workbook } from './Workbook';
import { Ctx, Mutation, Resolver } from 'type-graphql';
import { createBaseResolver } from './../Base/BaseResolvers';
import { Context } from '@src/auth/context';

import xml from 'xml2js';
import fs from 'fs';

import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';

const parser = new XMLParser();

const BaseResolver = createBaseResolver();

@Resolver(() => Workbook)
export class WorkbookResolvers extends BaseResolver {
    // @Mutation(() => Boolean)
    // async loadWorkbooks(@Ctx() { storage }: Context): Promise<boolean> {
    //     const files = await storage.files(StorageBucket.Workbooks, 'workbook');
    //     for (const file of files) {
    //         const [download] = await file.download();
    //         const {
    //             DocumentProperties: { Created },
    //             Worksheet: { Table },
    //         } = parser.parse(download).Workbook;
    //         const rows = Table.Row;
    //         console.log(rows.map((row) => row.Cell));
    //     }
    //     return true;
    // }
}

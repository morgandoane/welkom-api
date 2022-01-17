import {
    modelOptions,
    prop,
    getModelForClass,
    Severity,
} from '@typegoose/typegoose';
import { Field, ID } from 'type-graphql';
import { protos } from '@google-cloud/documentai';
import { File } from '@google-cloud/storage';

@modelOptions({
    schemaOptions: {
        collection: 'appfilecontents',
    },
    options: {
        allowMixed: Severity.ALLOW,
    },
})
export class AppFileContents {
    @Field(() => ID)
    @prop({ required: true })
    identifier!: string;

    @prop({ required: true })
    document_result!: protos.google.cloud.documentai.v1.IDocument;

    // @prop({ required: true })
    // vision_results!: protos.google.cloud.documentai.v1.IDocument[];

    public static fromResults(
        file: File,
        document_result: protos.google.cloud.documentai.v1.IDocument
        // vision_results: vision_protos.google.cloud.vision.v1.IAnnotateImageResponse[]
    ): AppFileContents {
        const content = new AppFileContents();
        content.identifier = file.metadata.id;
        content.document_result = document_result;
        // content.vision_results = vision_results;

        return content;
    }
}

export const AppFileContentModel = getModelForClass(AppFileContents);

import {
    AppFileContentModel,
    AppFileContents,
} from './../../schema/AppFileContent/AppFileContent';
import { File } from '@google-cloud/storage';
import {
    ImageAnnotatorClient,
    protos as vision_protos,
} from '@google-cloud/vision';
import {
    DocumentProcessorServiceClient,
    protos,
} from '@google-cloud/documentai';

export class DocumentAi {
    private document_client: DocumentProcessorServiceClient;
    private vision_client: ImageAnnotatorClient;

    constructor() {
        this.document_client = new DocumentProcessorServiceClient({
            projectId: process.env.GOOGLE_STORAGE_PROJECT_ID,
            credentials: {
                client_email: process.env.GOOGLE_STORAGE_EMAIL,
                private_key: process.env.GOOGLE_STORAGE_PRIVATE_KEY.replace(
                    /\\n/gm,
                    '\n'
                ),
            },
        });

        this.vision_client = new ImageAnnotatorClient({
            projectId: process.env.GOOGLE_STORAGE_PROJECT_ID,
            credentials: {
                client_email: process.env.GOOGLE_STORAGE_EMAIL,
                private_key: process.env.GOOGLE_STORAGE_PRIVATE_KEY.replace(
                    /\\n/gm,
                    '\n'
                ),
            },
        });
    }

    public async readFile(file: File): Promise<AppFileContents | null> {
        const exists = await file.exists();
        if (!exists) return null;

        const cached = await AppFileContentModel.findOne({
            identifier: file.metadata.id,
        });

        if (cached) return cached;

        const name = `projects/${process.env.GOOGLE_STORAGE_PROJECT_ID}/locations/us/processors/${process.env.GOOGLE_DOCUMENT_PROCESSOR}`;

        const [download] = await file.download();

        const encodedImage = download.toString('base64');

        const request: protos.google.cloud.documentai.v1.IProcessRequest = {
            name,
            rawDocument: {
                content: encodedImage,
                mimeType: 'application/pdf',
            },
        };

        // Recognizes text entities in the PDF document
        const [documentResult] = await this.document_client.processDocument(
            request
        );
        const { document } = documentResult;

        const res = await AppFileContentModel.create(
            AppFileContents.fromResults(file, document)
        );
    }
}

export const DocumentReader = new DocumentAi();

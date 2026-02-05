import { DocumentRepository } from "./Document.repository";
import { SubscriptionRepository } from "../subscription/Subscription.repository";
import { IDocument } from "./Document.types";
import { v4 as uuidv4 } from "uuid";
import { Database } from "../../core/Database";
import { AppError } from "../../core/ErrorHandler";

export class DocumentService {
  private docRepo = new DocumentRepository();
  private subRepo = new SubscriptionRepository();
  private db = Database.getInstance();

  async processUploads(
    files: Express.Multer.File[],
    userId: string,
    agencyId: string,
  ): Promise<IDocument[]> {
    // 1. Fetch active subscription
    const subscription = await this.subRepo.getActiveSubscription(agencyId);
    if (!subscription) {
      throw new AppError("No active subscription found", 403);
    }

    // 2. Verify dates
    const now = new Date();
    if (now < subscription.start_date || now > subscription.end_date) {
      throw new AppError("Subscription is expired or not yet active", 403);
    }

    // 3. Get Plan details for max limit
    const plan = await this.subRepo.getPlanById(
      subscription.subscription_plan_id,
    );
    if (!plan) {
      throw new AppError("Invalid subscription plan", 500);
    }

    const uploadedDocs: IDocument[] = [];

    // 4. Process each file in transaction
    await this.db.withTransaction(async (connection) => {
      for (const file of files) {
        // Check limit (LOCKING behavior is implicit in UPDATE or explicit SELECT FOR UPDATE)
        // For simplified optimistic check + atomic update:
        const limitExceeded = await this.docRepo.checkLimitExceeded(
          subscription.id!,
          plan.max_documents as number,
          connection,
        );

        if (limitExceeded) {
          throw new AppError(
            `Subscription limit reached. Cannot upload ${file.originalname}`,
            403,
          );
        }

        const docId = uuidv4();
        const doc: IDocument = {
          id: docId,
          agency_id: agencyId,
          uploaded_by: userId,
          status: "PROCESSED", // Simulating processing
        };

        // Insert Doc
        await this.docRepo.createDocument(doc, connection);

        // Increment Usage
        await this.docRepo.incrementUsage(subscription.id!, connection);

        uploadedDocs.push(doc);
      }
    });

    return uploadedDocs;
  }

  async getDocuments(agencyId: string) {
    return await this.docRepo.getDocumentsByAgency(agencyId);
  }
}

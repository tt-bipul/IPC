import { Database } from "../../core/Database";
import QueryBuilder from "../../core/QueryBuilder";
import { IDocument } from "./Document.types";
import { PoolConnection } from "mysql2/promise";

export class DocumentRepository {
  private db = Database.getInstance();

  async createDocument(
    doc: IDocument,
    connection?: PoolConnection,
  ): Promise<string> {
    const query = QueryBuilder.insert("documents")
      .data({
        id: doc.id,
        agency_id: doc.agency_id,
        uploaded_by: doc.uploaded_by,
        status: doc.status,
      })
      .build();

    await this.db.query(query.sql, query.params, connection);
    return doc.id;
  }

  async getDocumentsByAgency(agencyId: string): Promise<IDocument[]> {
    const query = QueryBuilder.selectAll()
      .from("documents")
      .where("agency_id", agencyId)
      .orderBy("created_at", "DESC")
      .build();

    return await this.db.query<IDocument[]>(query.sql, query.params);
  }

  async incrementUsage(
    subscriptionId: number,
    connection?: PoolConnection,
  ): Promise<void> {
    // Raw SQL for atomic increment
    const sql = `UPDATE agency_document_usage SET documents_processed = documents_processed + 1, last_processed_at = NOW() WHERE subscription_id = ?`;
    await this.db.query(sql, [subscriptionId], connection);
  }

  // Check if usage limit exceeded (Safe check)
  async checkLimitExceeded(
    subscriptionId: number,
    maxDocuments: number,
    connection?: PoolConnection,
  ): Promise<boolean> {
    const sql = `SELECT documents_processed FROM agency_document_usage WHERE subscription_id = ?`;
    const result = await this.db.query<any[]>(
      sql,
      [subscriptionId],
      connection,
    );

    if (result.length === 0) return true; // Should exist
    return result[0].documents_processed >= maxDocuments;
  }
}

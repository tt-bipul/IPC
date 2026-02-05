import { Request, Response, NextFunction } from "express";
import { AIService } from "../ai/AIService";
import { ComparisonEngine } from "../comparison/ComparisonEngine";
// import { BusinessRuleService } from '../rules/BusinessRule.service';
import { ReportService } from "../report/Report.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/AsyncHandler";
import { AuthRequest } from "../../middlewares/AuthMiddleware";
import { DocumentService } from "../document/Document.service";

export class ProcessController {
  private aiService: AIService;
  private comparisonEngine: ComparisonEngine;
  // private ruleService: BusinessRuleService;
  private reportService: ReportService;
  private documentService: DocumentService;

  constructor() {
    this.aiService = new AIService();
    this.comparisonEngine = new ComparisonEngine();
    // this.ruleService = new BusinessRuleService();
    this.reportService = new ReportService();
    this.documentService = new DocumentService();
  }

  public process = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const authReq = req as AuthRequest;
      const files = req.files as Express.Multer.File[];

      // Assuming agencyId is passed in body or available on user
      const agencyId = req.body.agency_id || (authReq.user as any).agency_id;
      if (!agencyId) {
        throw new Error("Agency ID required for processing");
      }
      const documents = await this.documentService.processUploads(
        files,
        authReq.user.id,
        agencyId,
      );

      const extractionResults = await this.aiService.extractData(documents);

      // const rules = await this.ruleService.getRulesByAgency(authReq.user, authReq.user.agency_id);

      // const comparison = this.comparisonEngine.compare(extractionResults[0], rules);

      // const report = await this.reportService.generateAndSend(authReq.user.id, authReq.body.email || authReq.user.email, comparison);

      // ApiResponse.success(res, { report, comparison }, 'Processing completed successfully');
    },
  );
}

import { ReportRepository } from "./Report.repository";
import { IReport } from "./Report.types";
import { PdfGenerator } from "../../utils/PdfGenerator";
import { sendMail } from "../../utils/EmailService";
import { v4 as uuidv4 } from "uuid";
import { DocumentComparisonReport } from "../comparison/Comparison.types";

export class ReportService {
  private reportRepository: ReportRepository;

  constructor() {
    this.reportRepository = new ReportRepository();
  }

  public async generateAndSend(
    agentId: string,
    email: string,
    comparison: DocumentComparisonReport,
  ): Promise<IReport> {
    const reportId = uuidv4();
    const pdfPath = PdfGenerator.generate(reportId, comparison);

    const newReport: IReport = {
      id: reportId,
      agent_id: agentId,
      status: comparison.overall_status,
      extracted_data: JSON.stringify(comparison),
      comparison_result: JSON.stringify(comparison.results),
      pdf_path: pdfPath,
      tenant_id: "",
      agency_id: "",
      version: 0,
    };

    await this.reportRepository.create(newReport);
    await sendMail(email, "", pdfPath);

    return newReport;
  }
}

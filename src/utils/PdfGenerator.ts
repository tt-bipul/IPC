import PDFDocument from 'pdfkit';
import fs from 'fs';
import { DocumentComparisonReport } from '../modules/comparison/Comparison.types';

export class PdfGenerator {
    public static generate(reportId: string, data: DocumentComparisonReport): string {
        const doc = new PDFDocument();
        const dir = 'outputs';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        const filePath = `${dir}/report_${reportId}.pdf`;
        doc.pipe(fs.createWriteStream(filePath));

        doc.fontSize(20).text('Insurance Policy Validation Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Report ID: ${reportId}`);
        doc.text(`Overall Status: ${data.overall_status}`);
        doc.moveDown();

        doc.text('Comparison Results:', { underline: true });
        data.results.forEach(res => {
            doc.text(`${res.field_name}: ${res.status}`);
            doc.text(`   Value: ${res.extracted_value}`);
            if (res.message) doc.text(`   Note: ${res.message}`);
            doc.moveDown(0.5);
        });

        doc.end();
        return filePath;
    }
}

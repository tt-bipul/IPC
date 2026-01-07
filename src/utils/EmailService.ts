import nodemailer from 'nodemailer';
import { Logger } from '../core/Logger';

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'test@example.com',
                pass: 'password'
            }
        });
    }

    public async sendReport(to: string, pdfPath: string): Promise<void> {
        try {
            Logger.info(`MOCK EMAIL: Sending report to ${to} with attachment ${pdfPath}`);
        } catch (error) {
            Logger.error('Failed to send email', error);
        }
    }
}

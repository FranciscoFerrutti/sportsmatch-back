import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as HandleBars from 'handlebars';
import * as path from 'path';

const FROM = "no-reply@sportsmatch-itba.com";
const FRONTEND_URI = process.env.FRONTEND_URI || "https://your-frontend-url.com";

export class MailService {

    private static instance: MailService;

    static getInstance() {
        if (!MailService.instance) MailService.instance = new MailService();
        return MailService.instance;
    }

    private constructor() {
    }


    public static async sendCustomMail() {
        const user= "solkonfe@gmail.com"
        const org = "itba"
        const subject = "Te aceptaron en una solicitud de reserva";

        const emailTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'emailTemplate.hbs'), 'utf8');
        const template = HandleBars.compile(emailTemplateSource);
        console.log('Current working directory:', process.cwd());
        const joinUrl = FRONTEND_URI + `/accept-invitation?user=${user}&org=${org}`;
        const html = template({
            message: "Tu reserva al partido fue aceptada",
            clickme: "Completa la reserva",
            url: joinUrl
        });

        await this.sendMail(user, subject, html);
    }

    public static async sendMail(to: string | string[], subject: string, html: string) {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: FROM,
            to: to,
            subject: subject,
            html: html
        };

        transporter.sendMail(mailOptions, (error, info)=> {
            if (error) {
                console.error(error);
            } else {
                console.log('Email sent: ' + info.response);

            }
        });
    }
}
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

    public static async sendNewReservation(user: string, reservationId: number) {
        const subject = "Tenes una nueva reserva";

        const emailTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'emailTemplate.hbs'), 'utf8');
        const template = HandleBars.compile(emailTemplateSource);

        const joinUrl = FRONTEND_URI + `/accept-invitation?user=${user}&org=${reservationId}`;
        const html = template({
            message: "Tu reserva fue aceptada. " +
                "Tenes una nueva reserva! Recordá aceptarla desde la web en la sección “Reservas”",
            clickme: "Completar reserva",
            url: joinUrl
        });

        await this.sendMail(user, subject, html);
    }
    public static async sendReservationDeclined(user: string, reservationId: number) {
        const subject = "Tu rerserva fue cancelada";

        const emailTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'emailTemplate.hbs'), 'utf8');
        const template = HandleBars.compile(emailTemplateSource);

        const joinUrl = FRONTEND_URI + `/accept-invitation?user=${user}&org=${reservationId}`;
        const html = template({
            message: "Lamentamos informarte que tu reserva fue cancelada. " +
                "Si efectuaste el pago lo veras reflejado el monto en los detalles de tu proxima factura o en tu cuenta corriente en caso de débito." +
                "Estas a tiempo reservar otra cancha!",
            clickme: "Crear evento",
            url: joinUrl
        });

        await this.sendMail(user, subject, html);
    }
    public static async sendReservationCompleted(user: string, reservationId: number) {
        const subject = "Tu reserva fue completada con el pago de la seña";

        const emailTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'emailTemplate.hbs'), 'utf8');
        const template = HandleBars.compile(emailTemplateSource);

        const joinUrl = FRONTEND_URI + `/accept-invitation?user=${user}&org=${reservationId}`;
        const html = template({
            message: "Recibimos el pago de la seña. " +
                "El dia del evento podras cancelar el monto restante en el club" +
                "Recorda que si cancelas con 24hs de anticipación, se te devolvera la seña",
            clickme: "Ver reserva",
            url: joinUrl
        });

        await this.sendMail(user, subject, html);
    }
    public static async sendReservationConfirmed(user: string, reservationId: number) {
        const subject = "Tu reserva fue confirmada";

        const emailTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'emailTemplate.hbs'), 'utf8');
        const template = HandleBars.compile(emailTemplateSource);

        const joinUrl = FRONTEND_URI + `/accept-invitation?user=${user}&org=${reservationId}`;
        const html = template({
            message: "Tu reserva fue aceptada. " +
                "Abona el monto de la seña para completar tu reserva. " +
                "Recorda que si cancelas con 24hs de anticipación, se te devolvera la seña",
            clickme: "Completar reserva",
            url: joinUrl
        });

        await this.sendMail(user, subject, html);
    }
    public static async sendReservationSubmit(user: string, club: string, date: string) {
        const subject = "Solicitud de reserva enviada";

        const emailTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'emailTemplate.hbs'), 'utf8');
        const template = HandleBars.compile(emailTemplateSource);

        const joinUrl = `sportsmatch://myevents`;
        const html = template({
            message: "Tu reserva para "+ club + " el dia " + date.split(' ')[0] + " fue solicitada con exito. " +
                "Recibiras otro mail cuando la misma sea aceptada por el club para enviar el pago de la seña. " +
                "Recorda que si cancelas con 24hs de anticipación, se te devolvera la seña",
            clickme: "Ver reserva",
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
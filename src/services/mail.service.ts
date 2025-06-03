import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as HandleBars from 'handlebars';

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

    //CANCEL RESERVATION
    public static async sendUserReservationDeclined(user: string, reservationId: number, club: string, date: string,month: string, hours: string) {
        const subject = "Tu rerserva fue cancelada";

        const emailTemplateSource = fs.readFileSync('src/services/templates/emailTemplate.hbs', 'utf8');
        const template = HandleBars.compile(emailTemplateSource);

        const joinUrl = FRONTEND_URI + `/accept-invitation?user=${user}&org=${reservationId}`;
        const html = template({
            message: "Lamentamos informarte que tu reserva en " + club + " para la fecha "+  date +"/"+month +" a las " + hours +"hs fue cancelada. " +
                "Estas a tiempo reservar otra cancha!",
            clickme: "Crear evento",
            url: joinUrl
        });

        await this.sendMail(user, subject, html);
    }

    public static async sendUserReservationRefund(user: string, reservationId: number, club: string, date: string,month: string, hours: string, amount: number) {
        const subject = "Tu rerserva fue cancelada";

        const emailTemplateSource = fs.readFileSync('src/services/templates/emailTemplate.hbs', 'utf8');
        const template = HandleBars.compile(emailTemplateSource);

        const joinUrl = FRONTEND_URI + `/accept-invitation?user=${user}&org=${reservationId}`;
        const html = template({
            message: "Lamentamos informarte que tu reserva en " + club + " para la fecha "+  date +"/"+month + " a las " + hours +"hs fue cancelada. " +
                "Te devolvimos $" + amount +". Lo veras reflejado el monto en los detalles de tu proxima factura o en tu cuenta corriente en caso de débito." +
                "Estas a tiempo reservar otra cancha!",
            clickme: "Crear evento",
            url: joinUrl
        });

        await this.sendMail(user, subject, html);
    }

    public static async sendClubReservationRefund(user: string, reservationId: number, field: string, date: string,month: string, hours: string, amount: number) {
        const subject = "Aviso de cancelacion de reserva";

        const emailTemplateSource = fs.readFileSync('src/services/templates/emailTemplate.hbs', 'utf8');
        const template = HandleBars.compile(emailTemplateSource);

        const joinUrl = FRONTEND_URI + `/reservations`;
        const html = template({
            message: "La reserva en la cancha nombre: " + field + " para la fecha "+  date +"/"+month + " a las " + hours + "hs fue cancelada." +
                "Como el usuario ya habia abonado la reserva le devolvimos $" + amount + ".",
            clickme: "Ver reservas",
            url: joinUrl
        });

        await this.sendMail(user, subject, html);
    }

    //-----------------------

    //RECEIVE PAYMENT
    public static async sendReservationCompleted(user: string, reservationId: number, club: string, date: string,month: string, hours: string) {
        const subject = "Recibimos tu pago!";

        const emailTemplateSource = fs.readFileSync('src/services/templates/emailTemplate.hbs', 'utf8');
        const template = HandleBars.compile(emailTemplateSource);

        const joinUrl = FRONTEND_URI + `/accept-invitation?user=${user}&org=${reservationId}`;
        const html = template({
            message: "Recibimos el pago de la seña del club " + club + " para la fecha " +  date +"/"+month +" a las " + hours +
                "hs. El dia del evento podras cancelar el monto restante en el club." +
                "\n Recorda que si cancelas con 24hs de anticipación, se te devolvera la seña.",
            clickme: "Ver reserva",
            url: joinUrl
        });

        await this.sendMail(user, subject, html);
    }

    public static async sendClubReservationCompleted(user: string, reservationId: number, field: string, date: string,month: string, hours: string, amount: number) {
        const subject = "Recibimos un pago!";

        const emailTemplateSource = fs.readFileSync('src/services/templates/emailTemplate.hbs', 'utf8');
        const template = HandleBars.compile(emailTemplateSource);

        const joinUrl = FRONTEND_URI + `/reservations`;
        const html = template({
            message: "Recibimos $" + amount + " del pago de la seña para la cancha nombre: " + field + " en la fecha "+  date +"/"+month + " a las " + hours + "hs",
            clickme: "Ver reserva",
            url: joinUrl
        });

        await this.sendMail(user, subject, html);
    }

    //-----------------------

    //CONFIRM RESERVATION
    public static async sendReservationConfirmed(user: string, reservationId: number, club: string, date: string, hour:string) {
        const subject = "Tu reserva fue confirmada";

        const emailTemplateSource = fs.readFileSync('src/services/templates/emailTemplate.hbs', 'utf8');
        const template = HandleBars.compile(emailTemplateSource);

        const joinUrl = FRONTEND_URI + `/accept-invitation?user=${user}&org=${reservationId}`;
        const html = template({
            message: "Tu reserva en " + club + " para la fecha "+  date + " a las " + hour + "hs fue aceptada. " +
                "Abona el monto de la seña para completar tu reserva. " +
                "Recorda que si cancelas con 24hs de anticipación, se te devolvera la seña.",
            clickme: "Completar reserva",
            url: joinUrl
        });

        await this.sendMail(user, subject, html);
    }
    //-----------------------

    //CREATE RESERVATION
    public static async sendReservationSubmit(user: string, club: string, date: string) {
        const subject = "Solicitud de reserva enviada";

        const emailTemplateSource = fs.readFileSync('src/services/templates/emailTemplate.hbs', 'utf8');
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
    public static async sendClubReservationSubmit(user: string, field: string, date: string) {
        const subject = "Tenes una nueva solicitud de reserva";

        const emailTemplateSource = fs.readFileSync('src/services/templates/emailTemplate.hbs', 'utf8');
        const template = HandleBars.compile(emailTemplateSource);

        const joinUrl = FRONTEND_URI + `/reservations`;
        const html = template({
            message: "Tenes una nueva reserva para la cancha nombre: "+ field + " el dia " + date.split(' ')[0] + ". Recordá aceptarla desde la web en la sección “Reservas”",
            clickme: "Ver reservas",
            url: joinUrl
        });

        await this.sendMail(user, subject, html);
    }
    //-----------------------

    //EMAIL VERIFICATION
    public static async sendClubEmailVerification(email: string, clubName: string, verificationToken: string) {
        const subject = "Verifica tu email - SportsMatch";

        const emailTemplateSource = fs.readFileSync('src/services/templates/emailTemplate.hbs', 'utf8');
        const template = HandleBars.compile(emailTemplateSource);

        const joinUrl = FRONTEND_URI + `/verify-email?token=${verificationToken}`;
        const html = template({
            message: "¡Bienvenido a SportsMatch " + clubName + "! " +
                "Para completar tu registro, por favor verifica tu dirección de email haciendo click en el botón de abajo. ",
            clickme: "Verificar Email",
            url: joinUrl
        });

        await this.sendMail(email, subject, html);
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
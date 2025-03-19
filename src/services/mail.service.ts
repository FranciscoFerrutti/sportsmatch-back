"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs = __importStar(require("fs"));
const HandleBars = __importStar(require("handlebars"));
const path = __importStar(require("path"));
const FROM = "no-reply@sportsmatch-itba.com";
const FRONTEND_URI = process.env.FRONTEND_URI || "https://your-frontend-url.com";
class MailService {
    static getInstance() {
        if (!MailService.instance)
            MailService.instance = new MailService();
        return MailService.instance;
    }
    constructor() {
    }
    //CANCEL RESERVATION
    static async sendUserReservationDeclined(user, reservationId, club, date) {
        const subject = "Tu rerserva fue cancelada";
        const emailTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'emailTemplate.hbs'), 'utf8');
        const template = HandleBars.compile(emailTemplateSource);
        const joinUrl = FRONTEND_URI + `/accept-invitation?user=${user}&org=${reservationId}`;
        const html = template({
            message: "Lamentamos informarte que tu reserva en " + club + " para la fecha " + date + " fue cancelada. " +
                "¡Estás a tiempo de reservar otra cancha!",
            clickme: "Crear evento",
            url: joinUrl
        });
        await this.sendMail(user, subject, html);
    }
    static async sendUserReservationRefund(user, reservationId, club, date, amount) {
        const subject = "Tu rerserva fue cancelada";
        const emailTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'emailTemplate.hbs'), 'utf8');
        const template = HandleBars.compile(emailTemplateSource);
        const joinUrl = FRONTEND_URI + `/accept-invitation?user=${user}&org=${reservationId}`;
        const html = template({
            message: "Lamentamos informarte que tu reserva en " + club + " para la fecha " + date + " fue cancelada. " +
                "Te devolvimos $" + amount + ". Verás reflejado el monto en los detalles de tu próxima factura ó en tu cuenta corriente en caso de débito." +
                "¡Estás a tiempo reservar otra cancha!",
            clickme: "Crear evento",
            url: joinUrl
        });
        await this.sendMail(user, subject, html);
    }
    static async sendClubReservationRefund(user, reservationId, field, date, amount) {
        const subject = "Aviso de cancelación de reserva";
        const emailTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'emailTemplate.hbs'), 'utf8');
        const template = HandleBars.compile(emailTemplateSource);
        const joinUrl = FRONTEND_URI + `/reservations`;
        const html = template({
            message: "La reserva en la cancha nombre: " + field + " para la fecha " + date + " fue cancelada." +
                "Como el usuario ya había abonado la reserva le devolvimos $" + amount + ".",
            clickme: "Ver reservas",
            url: joinUrl
        });
        await this.sendMail(user, subject, html);
    }
    //-----------------------
    //RECEIVE PAYMENT
    static async sendReservationCompleted(user, reservationId, club, date) {
        const subject = "¡Recibimos tu pago!";
        const emailTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'emailTemplate.hbs'), 'utf8');
        const template = HandleBars.compile(emailTemplateSource);
        const joinUrl = FRONTEND_URI + `/accept-invitation?user=${user}&org=${reservationId}`;
        const html = template({
            message: "Recibimos el pago de la seña del club " + club + " para la fecha " + date +
                "El día del evento podrás cancelar el monto restante en el club." +
                "\n Recordá que si cancelás con 24hs de anticipación, se te devolverá la seña.",
            clickme: "Ver reserva",
            url: joinUrl
        });
        await this.sendMail(user, subject, html);
    }
    static async sendClubReservationCompleted(user, reservationId, field, date, amount) {
        const subject = "¡Recibimos un pago!";
        const emailTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'emailTemplate.hbs'), 'utf8');
        const template = HandleBars.compile(emailTemplateSource);
        const joinUrl = FRONTEND_URI + `/reservations`;
        const html = template({
            message: "Recibimos $" + amount + " del pago de la seña para la cancha nombre: " + field + " en la fecha " + date,
            clickme: "Ver reserva",
            url: joinUrl
        });
        await this.sendMail(user, subject, html);
    }
    //-----------------------
    //CONFIRM RESERVATION
    static async sendReservationConfirmed(user, reservationId, club, date) {
        const subject = "Tu reserva fue confirmada";
        const emailTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'emailTemplate.hbs'), 'utf8');
        const template = HandleBars.compile(emailTemplateSource);
        const joinUrl = FRONTEND_URI + `/accept-invitation?user=${user}&org=${reservationId}`;
        const html = template({
            message: "Tu reserva en " + club + " para la fecha " + date + " fue aceptada. " +
                "Aboná el monto de la seña para completar tu reserva. " +
                "Recordá que si cancelás con 24hs de anticipación, se te devolverá la seña.",
            clickme: "Completar reserva",
            url: joinUrl
        });
        await this.sendMail(user, subject, html);
    }
    //-----------------------
    //CREATE RESERVATION
    static async sendReservationSubmit(user, club, date) {
        const subject = "Solicitud de reserva enviada";
        const emailTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'emailTemplate.hbs'), 'utf8');
        const template = HandleBars.compile(emailTemplateSource);
        const joinUrl = `sportsmatch://myevents`;
        const html = template({
            message: "Tu reserva para " + club + " el dia " + date.split(' ')[0] + " fue solicitada con éxito. " +
                "Recibirás otro mail cuando la misma sea aceptada por el club para enviar el pago de la seña. " +
                "Recordá que si cancelás con 24hs de anticipación, se te devolverá la seña",
            clickme: "Ver reserva",
            url: joinUrl
        });
        await this.sendMail(user, subject, html);
    }
    static async sendClubReservationSubmit(user, field, date) {
        const subject = "Tenés una nueva solicitud de reserva";
        const emailTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'emailTemplate.hbs'), 'utf8');
        const template = HandleBars.compile(emailTemplateSource);
        const joinUrl = FRONTEND_URI + `/reservations`;
        const html = template({
            message: "Tenés una nueva reserva para la cancha nombre: " + field + " el dia " + date.split(' ')[0] + ". Recordá aceptarla desde la web en la sección “Reservas”",
            clickme: "Ver reservas",
            url: joinUrl
        });
        await this.sendMail(user, subject, html);
    }
    //-----------------------
    //EMAIL VERIFICATION
    static async sendClubEmailVerification(email, clubName, verificationToken) {
        const subject = "Verificá tu email - SportsMatch";
        const emailTemplateSource = fs.readFileSync(path.join(__dirname, 'templates', 'emailTemplate.hbs'), 'utf8');
        const template = HandleBars.compile(emailTemplateSource);
        const joinUrl = FRONTEND_URI + `/verify-email?token=${verificationToken}`;
        const html = template({
            message: "¡Bienvenido a SportsMatch " + clubName + "! " +
                "Para completar tu registro, por favor verificá tu dirección de email haciendo click en el botón de abajo. ",
            clickme: "Verificar Email",
            url: joinUrl
        });
        await this.sendMail(email, subject, html);
    }
    static async sendMail(to, subject, html) {
        const transporter = nodemailer_1.default.createTransport({
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
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
}
exports.MailService = MailService;
//# sourceMappingURL=mail.service.js.map

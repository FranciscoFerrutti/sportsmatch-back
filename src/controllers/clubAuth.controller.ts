import {autobind} from "core-decorators";
import {HttpRequestInfo, validateBody} from "../middlewares/validation.middleware";
import Joi from "joi";
import {HTTP_METHODS, HTTP_STATUS} from "../constants/http.constants";
import {NextFunction, Request, Response} from "express";
import ClubAuthService from "../services/clubAuth.service";

@autobind
class ClubAuthController {
    private readonly authService: ClubAuthService;

    constructor() {
        this.authService = ClubAuthService.getInstance();
    }


    @validateBody(Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/).required(),
        name: Joi.string().required(),
        phoneNumber: Joi.string().required(),
    }))
    @HttpRequestInfo("/clubauth", HTTP_METHODS.POST)
    public async createAuth(req: Request, res: Response, next: NextFunction) {
        const email: string = req.body.email;

        try {
            await this.authService.createAuth(email.toLowerCase(), req.body.password, req.body.name, req.body.phoneNumber);
            res.status(HTTP_STATUS.CREATED).send();
        } catch (err) {
            next(err);
        }
    }

    @validateBody(Joi.object({
        token: Joi.string().required()
    }))
    @HttpRequestInfo("/clubauth/verify", HTTP_METHODS.POST)
    public async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            await this.authService.verifyEmail(req.body.token);
            res.status(HTTP_STATUS.OK).send({ message: "Email verified successfully" });
        } catch (err) {
            next(err);
        }
    }

    @HttpRequestInfo("/clubauth", HTTP_METHODS.GET)
    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.authService.login(req.userBasic.email.toLowerCase(), req.userBasic.password);
            res.header("c-api-key", user);
            res.status(HTTP_STATUS.OK).send();
        } catch (err) {
            next(err);
        }
    }
}

export default ClubAuthController;
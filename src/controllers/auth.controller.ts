import { autobind } from "core-decorators";
import AuthService from "../services/auth.service";
import { Request, Response, NextFunction } from "express";
import { HTTP_METHODS, HTTP_STATUS } from "../constants/http.constants";
import { HttpRequestInfo, validateBody } from "../middlewares/validation.middleware";
import Joi from "joi";


@autobind
class AuthController {
    private readonly authService: AuthService;

    constructor() {
        this.authService = AuthService.getInstance();
    }


    @validateBody(Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/).required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        birthdate: 
            Joi.custom((value, helpers) => {
                try {
                    const dateArray = value.split("/");
                    const newDateF = `${dateArray[1]}/${dateArray[0]}/${dateArray[2]}`
                    const date = new Date(newDateF);
                    if (!(date instanceof Date) || isNaN(date.valueOf()))
                        throw new Error("birthdate is not a valid date (DD/MM/YYYY)");
                } catch (err) {
                    throw new Error("birthdate is not a valid date (DD/MM/YYYY)");
                }
            }).required()
    }))
    @HttpRequestInfo("/auth", HTTP_METHODS.POST)
    public async createAuth(req: Request, res: Response, next: NextFunction) {
        const email: string = req.body.email;
        
        try {
            await this.authService.createAuth(email.toLowerCase(), req.body.password, req.body.firstName, req.body.lastName, req.body.phoneNumber, req.body.birthdate);
            res.status(HTTP_STATUS.CREATED).send();
        } catch (err) {
            next(err);
        }
    }

    @HttpRequestInfo("/auth", HTTP_METHODS.GET)
    public async login(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.authService.login(req.userBasic.email.toLowerCase(), req.userBasic.password);
            res.header("c-api-key", user.accessToken);
            res.status(HTTP_STATUS.OK).send({user: user.userDetail});
        } catch (err) {
            next(err);
        }
    }
}

export default AuthController;
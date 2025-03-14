import { NextFunction, Request, Response } from "express";
import UsersService from "../services/user.service";
import { HTTP_METHODS, HTTP_STATUS } from "../constants/http.constants";
import { autobind } from "core-decorators";
import { HttpRequestInfo, validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware";
import Joi from "joi";
import { document } from "../utils/swaggerDocumentation/annotations";
import { SwaggerEndpointBuilder } from "../utils/swaggerDocumentation/SwaggerEndpointBuilder";
import AWSService from "../services/aws.service";
import GenericException from "../exceptions/generic.exception";


@autobind
class UsersController {
    private readonly usersService: UsersService;
    //private readonly awsService: AWSService;

    constructor() {
        this.usersService = UsersService.getInstance();
        //this.awsService = AWSService.getInstance();
    }

    @document(SwaggerEndpointBuilder.create()
        .responses({
            "200": {
                description: "OK",
                schema: {
                    type: "object",
                }
            }
        })
    .build())
    @HttpRequestInfo("/users", HTTP_METHODS.GET)
    public async getUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.usersService.getUsers();
            res.status(HTTP_STATUS.OK).send(users);
        } catch (err) {
            next(err);
        }
    }

    @document(SwaggerEndpointBuilder.create()
        .responses({
            "200": {
                description: "OK",
                schema: {
                    type: "object",
                }
            }
        })
    .build())
    @validateParams(Joi.object({
        userId: Joi.number().optional(),
    }))
    @HttpRequestInfo("/users/:userId", HTTP_METHODS.GET)
    public async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.usersService.getUserDetailById(req.params.userId as string);
            res.status(HTTP_STATUS.OK).send(user);
        } catch (err) {
            next(err);
        }
    }

    @document(SwaggerEndpointBuilder.create()
        .responses({
            "201": {
                description: "created"
            }
        })
    .build())
    @validateBody(Joi.object({
        rating: Joi.number().min(1).max(5).raw().required(),
        eventId: Joi.number().min(1).required()
    }))
    @validateParams(Joi.object({
        userId: Joi.number().min(1).required()
    }))
    @HttpRequestInfo("/users/:userId/rating", HTTP_METHODS.POST)
    public async rateUser(req: Request, res: Response, next: NextFunction) {
        const { rating, eventId } = req.body;
        const rater = req.user.id;
        const rated = req.params.userId;

        try {
            if (rated === rater) throw new GenericException({ message: "User can't rate himself", status: HTTP_STATUS.BAD_REQUEST, internalStatus: "BAD_REQUEST"});

            await this.usersService.rateUser(rated, rater, rating, eventId);
            res.status(HTTP_STATUS.CREATED).send();
        } catch (err) {
            next(err);
        }
    }

    @document(SwaggerEndpointBuilder.create()
        .responses({
            "200": {
                description: "OK",
            }
        })
        .build()
    )
    @validateParams(Joi.object({
        userId: Joi.number().min(1).required()
    }))
    @validateBody(Joi.object({
        phoneNumber: Joi.string().optional(),
        locations: Joi.array().items(Joi.string()).optional(),
        sports: Joi.array().items(Joi.number()).optional()
    }))
    @HttpRequestInfo("/users/:userId", HTTP_METHODS.PUT)
    public async updateUser(req: Request, res: Response, next: NextFunction) {
        const userIdPath = req.params.userId;
        const { phoneNumber, locations, sports } = req.body;
        const userId = req.user.id;

        try {
            if (userIdPath !== userId) throw new Error("User can't update another user");

            await this.usersService.updateUser(userId, phoneNumber, locations, sports);
            res.status(HTTP_STATUS.OK).send();
        } catch (err) {
            next(err);
        }
    }
    /*
    public async getUserImage(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.userId;
        
        try {
            const presignedGetUrl = this.awsService.getPresignedGetUrl(`userid:${userId}`);
            res.status(HTTP_STATUS.OK).send({ presignedGetUrl });
        } catch (err) {
            next(err);
        }
    }

    public async updateUserImage(req: Request, res: Response, next: NextFunction) {
        const userId = req.user.id;
        
        try {
            const contentType = req.headers['content-type'] || 'image/png';
            const presignedPutUrl = this.awsService.getPresignedPostUrl(`userid:${userId}`,contentType);
            res.status(HTTP_STATUS.OK).send({ presignedPutUrl });
        } catch (err) {
            next(err);
        }
    }
     */
}

export default UsersController;

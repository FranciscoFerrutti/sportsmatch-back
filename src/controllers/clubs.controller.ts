import ClubService from "../services/club.service";
import {autobind} from "core-decorators";
import {document} from "../utils/swaggerDocumentation/annotations";
import {SwaggerEndpointBuilder} from "../utils/swaggerDocumentation/SwaggerEndpointBuilder";
import {HttpRequestInfo, validateBody, validateParams} from "../middlewares/validation.middleware";
import {HTTP_METHODS, HTTP_STATUS} from "../constants/http.constants";
import {NextFunction, Request, Response} from "express";
import Joi from "joi";

@autobind
class ClubsController{
    private readonly clubService: ClubService;

    constructor() {
        this.clubService = ClubService.getInstance()
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
    @HttpRequestInfo("/clubs", HTTP_METHODS.GET)
    public async getClubs(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.clubService.getClubs();
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
        clubId: Joi.number().optional(),
    }))
    @HttpRequestInfo("/clubs/:clubId", HTTP_METHODS.GET)
    public async getClub(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.clubService.getClubById(req.params.clubId as string);
            res.status(HTTP_STATUS.OK).send(user);
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
        clubId: Joi.number().min(1).required()
    }))
    @validateBody(Joi.object({
        phoneNumber: Joi.string().optional(),
        location: Joi.string().optional(),
    }))
    @HttpRequestInfo("/clubs/:clubId", HTTP_METHODS.PUT)
    public async updateClub(req: Request, res: Response, next: NextFunction) {
        const userIdPath = req.params.clubId;
        const { phoneNumber, location } = req.body;
        const userId = req.user.id;

        try {
            if (userIdPath !== userId) throw new Error("User can't update another user");

            await this.clubService.updateClub(userId, phoneNumber, location);
            res.status(HTTP_STATUS.OK).send();
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
        clubId: Joi.number().min(1).required()
    }))
    @validateBody(Joi.object({
        phoneNumber: Joi.string().optional(),
        location: Joi.string().optional(),
    }))
    @HttpRequestInfo("/clubs/:clubId/location", HTTP_METHODS.PUT)
    public async updateLocation(req: Request, res: Response, next: NextFunction) {
        const userIdPath = req.params.clubId;
        // const { latitude, longitude, address } = req.body;
        const userId = req.user.id;

        try {
            if (userIdPath !== userId) throw new Error("User can't update another user");
            // console.log(latitude,longitude,address)
            // await this.clubService.updateLocation(userId, latitude, longitude, address);
            res.status(HTTP_STATUS.OK).send();
        } catch (err) {
            next(err);
        }
    }
}

export default ClubsController;
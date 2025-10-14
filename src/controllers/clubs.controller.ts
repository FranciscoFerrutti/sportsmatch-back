import ClubService from "../services/club.service";
import {autobind} from "core-decorators";
import {document} from "../utils/swaggerDocumentation/annotations";
import {SwaggerEndpointBuilder} from "../utils/swaggerDocumentation/SwaggerEndpointBuilder";
import {HttpRequestInfo, validateBody, validateParams} from "../middlewares/validation.middleware";
import {HTTP_METHODS, HTTP_STATUS} from "../constants/http.constants";
import {NextFunction, Request, Response} from "express";
import Joi, {options} from "joi";
import {LOCATION_COORDINATES} from "../constants/neighbourhoods.constants";
import AWSService from "../services/aws.service";

@autobind
class ClubsController{
    private readonly clubService: ClubService;
    private readonly awsService: AWSService;

    constructor() {
        this.clubService = ClubService.getInstance();
        this.awsService = AWSService.getInstance();
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
            const { clubId, location, radius } = req.query;

            if (clubId) {
                const club = await this.clubService.getClubById(clubId as string);
                return res.status(HTTP_STATUS.OK).send(club);
            }

            if (location) {
                const clubs = await this.clubService.getNearClubs(location as string, radius ? Number(radius) : undefined);
                return res.status(HTTP_STATUS.OK).send(clubs);
            }

            const clubs = await this.clubService.getClubs();
            res.status(HTTP_STATUS.OK).send(clubs);
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
        description: Joi.string().optional(),
        imageUrl: Joi.string().uri().optional()
    }))
    @HttpRequestInfo("/clubs/:clubId", HTTP_METHODS.PUT)
    public async updateClub(req: Request, res: Response, next: NextFunction) {
        const userIdPath = req.params.clubId;
        const { phoneNumber, description, imageUrl } = req.body;
        const userId = req.user.id;

        try {
            if (userIdPath !== userId) throw new Error("User can't update another user");

            await this.clubService.updateClub(userId, phoneNumber, description, imageUrl);
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
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        address: Joi.string().required(),
        locality: Joi.string().required()
    }))
    @HttpRequestInfo("/clubs/:clubId/location", HTTP_METHODS.PUT)
    public async updateLocation(req: Request, res: Response, next: NextFunction) {
        const userIdPath = Number(req.params.clubId);
        const { latitude, longitude, address, locality } = req.body;
        const userId = Number(req.user.id);

        try {
            if (userIdPath !== userId) throw new Error("User can't update another user");
            await this.clubService.updateLocation(userId, latitude, longitude, address, locality);
            res.status(HTTP_STATUS.OK).send();
        } catch (err) {
            next(err);
        }
    }

    
    @document(SwaggerEndpointBuilder.create()
        .responses({ "200": { description: "OK", schema: { type: "object" } } })
        .build()
    )
    @HttpRequestInfo("/clubs/:clubId/image", HTTP_METHODS.GET)
    public async getClubImage(req: Request, res: Response, next: NextFunction) {
        const clubId = req.params.clubId;
        try {
            const presignedGetUrl = this.awsService.getPresignedGetUrl(`club_profile_${clubId}.png`);
            res.status(HTTP_STATUS.OK).send({ presignedGetUrl });
        } catch (err) {
            next(err);
        }
    }
    @document(SwaggerEndpointBuilder.create()
        .responses({ "200": { description: "OK" } })
        .build()
    )
    @validateParams(Joi.object({ clubId: Joi.number().min(1).required() }))
    @validateBody(Joi.object({
        phoneNumber: Joi.string().optional(),
        imageUrl: Joi.string().uri().optional(),
        description: Joi.string().optional()
    }))
    @HttpRequestInfo("/clubs/:clubId/image", HTTP_METHODS.PUT)
    public async updateClubImage(req: Request, res: Response, next: NextFunction) {
        const clubId = req.params.clubId;
        try {
            if (!clubId) {
                console.warn("⚠️ clubId no proporcionado en la solicitud.");
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: "El ID del club es obligatorio." });
            }
            const contentType = req.headers['content-type'] || 'image/png';
            const imageKey = `club_profile_${clubId}.png`;
            console.log(`📌 Generando presigned PUT URL para: ${imageKey} con Content-Type: ${contentType}`);
            // Generar URL pre-firmada para subir la imagen
            const presignedPutUrl = this.awsService.getPresignedPostUrl(imageKey, contentType);
            if (!presignedPutUrl) {
                throw new Error("No se pudo generar la URL pre-firmada.");
            }
            // Construir la URL pública de la imagen en S3
            const imageUrl = `https://new-sportsmatch-user-pictures-2025.s3.amazonaws.com/${imageKey}`;
            // Guardar la URL de la imagen en la base de datos
            await this.clubService.updateClub(clubId, undefined, undefined, imageUrl);
            console.log(`✅ Imagen URL guardada en la base de datos: ${imageUrl}`);
            console.log(`🔗 Presigned PUT URL: ${presignedPutUrl}`);
            res.status(HTTP_STATUS.OK).json({ presignedPutUrl, imageUrl });
        } catch (err) {
            console.error("❌ Error al generar presigned PUT URL o actualizar la imagen:", err);
            next(err);
            next(err);
        }
    }

}

export default ClubsController;
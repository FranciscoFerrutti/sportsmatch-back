import { Request, Response, NextFunction } from "express";
import { HTTP_METHODS, HTTP_STATUS } from "../constants/http.constants";
import { HttpRequestInfo } from "../middlewares/validation.middleware";
import { autobind } from "core-decorators";
import { document } from "../utils/swaggerDocumentation/annotations";
import { SwaggerEndpointBuilder } from "../utils/swaggerDocumentation/SwaggerEndpointBuilder";
import SportsService from "../services/sports.service";

@autobind
class SportsController {
    private readonly sportsService: SportsService;
    
    constructor() {
        this.sportsService = SportsService.getInstance();
    }


    @document(SwaggerEndpointBuilder.create()
        .responses({
            "200": {
                description: "OK",
                schema: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "number" },
                            name: { type: "string" }
                        }
                    }
                }
            }
        })
        .build())
    @HttpRequestInfo("/sports", HTTP_METHODS.GET)
    public async getSports(req: Request, res: Response, next: NextFunction) {
        try {
            const sports = await this.sportsService.getSports();
            res.status(HTTP_STATUS.OK).send(sports);
        } catch (err) {
            next(err);
        }
    }
}

export default SportsController;
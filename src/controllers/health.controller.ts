import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http.constants';
import { document } from '../utils/swaggerDocumentation/annotations';
import { SwaggerBuilder } from '../utils/swaggerDocumentation/swaggerBuilder';
import { autobind } from 'core-decorators';

@autobind
export default class HealthController {

    @document(SwaggerBuilder.getInstance().path('/health', 'get').responses({
        '200': {
            description: 'OK',
        }
    }).build())
    @document(SwaggerBuilder.getInstance().path('/health', 'post').responses({
        '200': {
            description: 'OK',
        }
    }).build())
    public async healthCheck(req: Request, res: Response, next: NextFunction) {
        res.status(HTTP_STATUS.OK).send();
    };
}

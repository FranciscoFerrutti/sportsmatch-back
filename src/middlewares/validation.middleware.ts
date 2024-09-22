import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import GenericException from '../exceptions/generic.exception';
import { SwaggerBuilder } from '../utils/swaggerDocumentation/swaggerBuilder';
import { translateJoiToSwagger } from '../utils/swaggerDocumentation/swaggerJoi.helper';
import { HTTP_METHODS, HTTP_PARAMETERS, HTTP_STATUS } from '../constants/http.constants';

// this function is weird because of the way the enum is defined in typescript
export const JoiEnum = (enumObject: any) => {
    const enumValues = Object.values(enumObject);
    return Joi.object().valid(...enumValues);
}

type validateType = (schema: Joi.ObjectSchema) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void

export const validateQuery: validateType = (schema) => {
    return validationHelper(schema, HTTP_PARAMETERS.QUERY);
};

export const validateBody: validateType = (schema) => {
    return validationHelper(schema, HTTP_PARAMETERS.BODY);
};

export const validateParams: validateType = (schema) => {
    return validationHelper(schema, HTTP_PARAMETERS.PATH);
};

const validationHelper = (schema: Joi.ObjectSchema, source: HTTP_PARAMETERS) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const reqData = (target.__httpRequestInfo ?? {})[propertyKey] as any;
        if (reqData) SwaggerBuilder.getInstance().addEndpointBuilder(reqData.originalUrl, reqData.method ?? HTTP_METHODS.GET)
            .addOperationId(propertyKey).parameters(translateJoiToSwagger(schema, source)).build();
        const originalMethod = descriptor.value;
        descriptor.value = function async (req: Request, res: Response, next: NextFunction) {
            const { error } = schema.validate(req[(source === HTTP_PARAMETERS.PATH)? "params": source]);
            if (error) {
                next(new GenericException({ 
                    message: error.details.map((e: any) => {
                        if (e.type === 'any.custom') {
                            const message = e.message as string;
                            return message.substring(message.indexOf('because ') + 8);
                        }
                        return e.message.replace(/"/g, '')
                    }).join(', '),
                    status: HTTP_STATUS.BAD_REQUEST,
                    internalStatus: "BAD_REQUEST"
                }));
            } else {
                originalMethod.apply(this, [req, res, next]);
            }
        };
    };
}

export const HttpRequestInfo = (originalUrl: string, method: string) => {
    return (target: any, key: string) => {
      if (!target.__httpRequestInfo) {
        target.__httpRequestInfo = {};
      }
      target.__httpRequestInfo[key] = { originalUrl: transformExpressRoute(originalUrl), method };
    };
  };

  function transformExpressRoute(path: string): string {
    // Use a regular expression to match dynamic route segments
    const transformedPath = path.replace(/:(\w+)/g, '{$1}');
    return transformedPath;
  } 
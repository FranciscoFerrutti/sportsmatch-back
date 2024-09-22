import { SwaggerEndpoint } from './swagger.interface';
import { SwaggerBuilder } from './swaggerBuilder';

export function document(swaggerEndpoint: SwaggerEndpoint) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const reqData = Object.values((Object.values(target.__httpRequestInfo ?? {}) ?? [{originalMethod: undefined, method: undefined}]))[0] as any;
    if (reqData) {
        SwaggerBuilder.getInstance().addEndpointBuilder(reqData.originalUrl, reqData.method, swaggerEndpoint);
    }

  };
}

import Joi from "joi";
import { HTTP_PARAMETERS } from "../../constants/http.constants";

export function translateExpressToSwaggerHttpParameters(source: HTTP_PARAMETERS) {
  if (source === HTTP_PARAMETERS.PATH) return HTTP_PARAMETERS.PATH;
  return source;
}

// Translate Joi schema to Swagger parameter definitions
export function translateJoiToSwagger(joiSchema: Joi.ObjectSchema, source: HTTP_PARAMETERS): any[] {
  const swaggerParameters: any[] = [];

  if (source === HTTP_PARAMETERS.BODY) {
    const bodySchema: any = {
      type: 'object',
      properties: {},
      required: [],
    };

    Object.keys(joiSchema.describe().keys).forEach((key: any) => {
      const joiParameter: Joi.Schema<any> = joiSchema.extract(key);
      const flags = joiParameter.describe().flags as any;

      const type = joiParameter.describe().type;

      // Map Joi types to Swagger types
      bodySchema.properties[key] = convertTypes(type);

      const valids = joiParameter.describe().valids;
      // Translate constraints (e.g., min, max) to Swagger attributes (e.g., minimum, maximum)
      if (valids?.includes(null)) {
        bodySchema.properties[key].nullable = true;
      }
      if (valids?.includes(undefined)) {
        bodySchema.properties[key].nullable = true;
      }

      const rules = joiParameter.describe().rules;
      addRules(rules, bodySchema.properties[key]);

      if (flags?.presence === 'required') {
        bodySchema.required.push(key);
      }
    });

    swaggerParameters.push({
      name: 'body',
      in: 'body',
      required: true,
      schema: bodySchema,
    });
  } else {
    // console.log(joiSchema.describe().keys);
    return [];
    Object.keys(joiSchema.describe().keys).forEach((key: any) => {
      const joiParameter: Joi.Schema<any> = joiSchema.extract(key);
      const flags = joiParameter.describe().flags as any;

      const swaggerParameter: any = {
        name: key,
        in: source, // or 'path', 'header', 'cookie', etc., depending on the use case
        description: joiParameter.describe().description,
        required: source === HTTP_PARAMETERS.PATH || flags.presence === 'required',
      };

      const type = joiParameter.describe().type;

      // Map Joi types to Swagger types
      swaggerParameter.type = convertTypes(type);

      const valids = joiParameter.describe().valids;
      // Translate constraints (e.g., min, max) to Swagger attributes (e.g., minimum, maximum)
      if (valids?.includes(null)) {
        swaggerParameter.nullable = true;
      }
      if (valids?.includes(undefined)) {
        swaggerParameter.nullable = true;
      }

      const rules = joiParameter.describe().rules;
      addRules(rules, swaggerParameter);

      swaggerParameters.push(swaggerParameter);
    });
  }

  return swaggerParameters;

  function convertTypes(type: string | undefined) {
    if (type === 'string') {
      return { type: 'string' };
    } else if (type === 'number') {
      return { type: 'number' };
    } else if (type === 'boolean') {
      return { type: 'boolean' };
    } else if (type === 'date') {
      return { type: 'string', format: "date-time" };
    }
  }

  function addRules(rules: any[], swaggerParameter: any) {
    if (rules) {
      rules.forEach((rule: any) => {
        if (rule.name === 'min') {
          swaggerParameter.minimum = rule.args.limit;
        }
        if (rule.name === 'max') {
          swaggerParameter.maximum = rule.args.limit;
        }
      });
    }
  }
}

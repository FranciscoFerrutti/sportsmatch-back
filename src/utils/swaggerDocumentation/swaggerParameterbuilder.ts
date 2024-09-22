import { HTTP_PARAMETERS } from "../../constants/http.constants";
import { SwaggerParameter } from "./swagger.interface";

export class SwaggerParameterBuilder {
  private constructor(private parameter: SwaggerParameter) {}

  // Create a new Swagger parameter builder
  static create(name: string) {
    const parameter: SwaggerParameter = {
      name,
      in: HTTP_PARAMETERS.QUERY, // Default to 'query'
      required: false, // Default to false
      type: 'string', // Default to 'string'
    };
    return new SwaggerParameterBuilder(parameter);
  }

  // Set the location of the parameter (e.g., 'query', 'path', 'header', 'cookie')
  location(inLocation: HTTP_PARAMETERS) {
    this.parameter.in = inLocation;
    return this;
  }

  // Set the description of the parameter
  description(description: string) {
    this.parameter.description = description;
    return this;
  }

  // Set whether the parameter is required
  required(required: boolean) {
    this.parameter.required = required;
    return this;
  }

  // Set the data type of the parameter (e.g., 'string', 'number', 'boolean', etc.)
  type(type: string) {
    this.parameter.type = type;
    return this;
  }

  // Set the format of the parameter (if applicable)
  format(format: string) {
    this.parameter.format = format;
    return this;
  }

  // Build and return the Swagger parameter object
  build(): SwaggerParameter {
    return this.parameter;
  }
}

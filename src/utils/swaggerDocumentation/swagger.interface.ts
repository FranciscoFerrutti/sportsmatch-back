import { HTTP_PARAMETERS } from "../../constants/http.constants";

export interface SwaggerEndpoint {
    operationId?: string;
    summary?: string;
    description?: string;
    tags?: string[];
    parameters?: SwaggerParameter[];
    requestBody?: any;
    responses?: { [statusCode: string]: SwaggerResponse };
  }
  
export interface SwaggerParameter {
    name: string;
    in: HTTP_PARAMETERS;
    description?: string;
    required: boolean;
    type: string;
    format?: string;
    schema?: {[key: string]: any}
    // Add any other properties specific to parameters
}

export interface SwaggerResponse {
    description: string;
    schema?: any; // Define a more specific schema type if needed
    // Add any other properties specific to responses
}
  

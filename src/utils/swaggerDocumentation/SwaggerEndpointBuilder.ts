import {
  SwaggerEndpoint,
  SwaggerParameter,
  SwaggerResponse,
} from "./swagger.interface";

export class SwaggerEndpointBuilder {
  private endpoint: SwaggerEndpoint;

  constructor(pathObject?: SwaggerEndpoint) {
    this.endpoint = pathObject ?? {};
  }

  static create(): SwaggerEndpointBuilder {
    return new SwaggerEndpointBuilder();
  }

  addOperationId(operationId: string): this {
    this.endpoint.operationId = operationId;
    return this;
  }

  summary(summary: string): this {
    this.endpoint.summary = summary;
    return this;
  }

  description(description: string): this {
    this.endpoint.description = description;
    return this;
  }

  // tags(tags: string[]): this {
  //   (this.endpoint.tags ?? []).push(...tags);
  //   return this;
  // }

  parameters(parameters: SwaggerParameter[]): this {
    if (this.endpoint.parameters === undefined) this.endpoint.parameters = [];
    parameters.forEach((parameter) =>
      this.endpoint.parameters?.push(parameter)
    );
    return this;
  }

  responses(responses: { [key: string]: SwaggerResponse }): this {
    this.endpoint.responses = responses;
    return this;
  }

  build() {
    if (this.endpoint.responses === undefined) this.endpoint.responses = {};
    this.endpoint.responses["400"] = {
      description: "Bad Request",
      schema: {
        $ref: "#/components/schemas/IErrorData",
      },
    };

    const body = this.endpoint.parameters?.find((p) => p.in === "body");
    if (body) {
      this.endpoint.parameters = this.endpoint.parameters?.filter((p) => p.in !== "body");
      this.endpoint.requestBody = {
        content: {
          "application/json": {
            schema: body.schema
          }
        }
      }
    }
    return this.endpoint;
  }
}

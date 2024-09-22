import { SwaggerEndpointBuilder } from './SwaggerEndpointBuilder';
import { SwaggerEndpoint } from './swagger.interface';

export class SwaggerBuilder {
  private static instance: SwaggerBuilder | null = null; // Singleton instance
  private paths: { [key: string]: any } = {};

  private constructor() {} // Private constructor to prevent external instantiation

  // Method to get or create the singleton instance
  public static getInstance(): SwaggerBuilder {
    if (!SwaggerBuilder.instance) {
      SwaggerBuilder.instance = new SwaggerBuilder();
    }
    return SwaggerBuilder.instance;
  }

  // Create and return a new SwaggerEndpointBuilder for a specific path
  path(path: string, method: string) {
    if (!this.paths[path]) {
      this.paths[path] = {};
    }
    if (!this.paths[path][method]) {
      this.paths[path][method] = {};
    }
    return new SwaggerEndpointBuilder(this.paths[path][method]);
  }

  addEndpointBuilder(path: string, method: string, endpointBuilder?: SwaggerEndpoint): SwaggerEndpointBuilder {
    if (!this.paths[path]) {
      this.paths[path] = {};
    }
    if (!this.paths[path][method]) {
      this.paths[path][method] = {};
    }
    this.paths[path][method] = {...this.paths[path][method],...endpointBuilder};
    return new SwaggerEndpointBuilder(this.paths[path][method]);
  }

  // Build the entire Swagger documentation object
  build(): { [key: string]: any } {
    // add error model
    

    const paths = Object.keys(this.paths);
    // add tag of first path
    paths.forEach((path) => {
      const methods = Object.keys(this.paths[path]);
      methods.forEach((method) => {
        if (this.paths[path][method].tags === undefined) {
          this.paths[path][method].tags = [toCamelCase(path.split('/')[1])] ?? [];
        }
      });
    });
    return {
      ...this.paths,
    };
  }
}

const toCamelCase = (str: string) => {
  const chars = str.split('');
  chars[0] = chars[0].toUpperCase();
  return chars.join('');
}

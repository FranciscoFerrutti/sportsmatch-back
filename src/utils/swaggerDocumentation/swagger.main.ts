import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import { SwaggerBuilder } from './swaggerBuilder';

const swaggerAPI = {
  openapi: '3.0.0',
  info: {
    title: 'Sports Match App API',
    version: '1.0.0',
    description: 'Sports Match App API',
  },
  paths: SwaggerBuilder.getInstance().build(),
  tags: [
    {
      name: 'Users',
      description: 'Endpoints related to user management.',
    },
    {
      name: 'Events',
      description: 'Endpoints related to event management.',
    },
    {
      name: 'Health',
      description: 'Endpoints for health check.',
    },
  ],
  components: {
    schemas: {
      IErrorData: {
        type: 'object',
        properties: {
          status: {
            type: 'integer',
            format: 'int32',
            description: 'The HTTP status code associated with the error.',
          },
          internalStatus: {
            type: 'string',
            description: 'An internal status code or error code.',
          },
          message: {
            type: 'string',
            description: 'A human-readable error message.',
          },
        },
        required: ['status', 'internalStatus', 'message'],
      },
    },
  },
};

// console.log(JSON.stringify(swaggerAPI));

function initializeSwagger(app: Application) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerAPI));

  app.get('/swagger.json', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerAPI);
  });
}

export default initializeSwagger;

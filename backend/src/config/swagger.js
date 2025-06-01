const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Calendar API',
      version: '1.0.0',
      description: 'API para gestión de calendarios y eventos',
      contact: {
        name: 'Calendar App Team',
        email: 'contact@calendarapp.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Contraseña del usuario',
            },
            name: {
              type: 'string',
              description: 'Nombre del usuario',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
            },
          },
        },
        Event: {
          type: 'object',
          required: ['title', 'startDate'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del evento',
            },
            title: {
              type: 'string',
              description: 'Título del evento',
            },
            description: {
              type: 'string',
              description: 'Descripción del evento',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de inicio',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de fin',
            },
            location: {
              type: 'string',
              description: 'Ubicación del evento',
            },
            userId: {
              type: 'integer',
              description: 'ID del usuario propietario',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
            },
          },
        },
        Setting: {
          type: 'object',
          required: ['key', 'value'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la configuración',
            },
            key: {
              type: 'string',
              description: 'Clave de la configuración',
            },
            value: {
              type: 'string',
              description: 'Valor de la configuración',
            },
            userId: {
              type: 'integer',
              description: 'ID del usuario propietario',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error',
            },
            message: {
              type: 'string',
              description: 'Descripción detallada del error',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.js', // Rutas donde están los comentarios de Swagger
  ],
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
}; 
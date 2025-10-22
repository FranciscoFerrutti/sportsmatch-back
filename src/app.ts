import express, { Application } from 'express';
import cors from 'cors';

import ErrorHandlerMiddleware from './middlewares/errorHandler.middleware';
import HealthRoutes from './routes/health.routes';
import { createDBTables } from './utils/dblocalHelper';
import UsersRoutes from './routes/users.routes';
import EventsRoutes from './routes/events.routes';
import initializeSwagger from './utils/swaggerDocumentation/swagger.main';
import './database/connection';
import AuthRoutes from './routes/auth.routes';
import ClubAuthRoutes from "./routes/clubAuth.routes";
import ClubRoutes from "./routes/clubs.routes";
import FieldsRoutes from "./routes/fields.routes";
import ReservationsRoutes from "./routes/reservations.routes";
import SportsRoutes from "./routes/sports.routes";
import PaymentRoutes from "./routes/payment.routes";
import sequelize from './database/connection';
import Sport from './database/models/Sport.model';

class App {
    public app: Application;
    private readonly setBasicConfig: boolean;

    constructor(setBasicConfig = true) {
        this.app = express();
        this.setBasicConfig = setBasicConfig;

        this.configureExpress();

        this.initializeDatabases();

        console.log("Initializing services...");
        this.initializeServices();

        console.log("Initializing routes...");

        this.initializeRoutes();

        console.log("Initializing error handling...");

        this.initializeErrorHandling();

        console.log("Initializing Swagger...");

        this.initializeSwaggerApp();
    }

    private configureExpress(): void {
        if (this.setBasicConfig) {
            this.app.use(express.json({ limit: '50mb' }));
            this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
            this.app.use(cors(
                {
                    exposedHeaders: ['c-api-key'],
                }
            ));
        }

        this.app.set('trust proxy', 1);
    }

    private initializeDatabases(): void {
        if (process.env.DB_HOST) {
            try {
                sequelize.sync({force: false})
                    .then(async() => {
                        console.log("Connected to DB");
                        await Sport.seedSports();
                        console.log("Deportes iniciales insertados");
                    })
                    .catch((err) => {
                        console.error("Error connecting to the database:", err);
                    });
                // createDBTables().then(async () => {
                    // console.log("Connected to DB");
                // }).catch((err) => { console.log(err); });
            } catch (err) {
                console.log(err);
            }
        }
    }

    private initializeServices(): void {
    }

    private initializeRoutes(): void {
        this.app.use('/health', new HealthRoutes().router);
        this.app.use('/users', new UsersRoutes().router);
        this.app.use('/events', new EventsRoutes().router);
        this.app.use('/auth', new AuthRoutes().router);
        this.app.use('/clubauth', new ClubAuthRoutes().router);
        this.app.use('/clubs', new ClubRoutes().router);
        this.app.use('/fields', new FieldsRoutes().router);
        this.app.use('/reservations', new ReservationsRoutes().router);
        this.app.use('/sports', new SportsRoutes().router);
        this.app.use('/payments', new PaymentRoutes().router);
    }

    private initializeSwaggerApp(): void {
        initializeSwagger(this.app);
    }

    private initializeErrorHandling(): void {
        this.app.use(ErrorHandlerMiddleware);
    }
}

export default new App().app;

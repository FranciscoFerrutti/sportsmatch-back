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

class App {
    public app: Application;
    private readonly setBasicConfig: boolean;

    constructor(setBasicConfig = true) {
        this.app = express();
        this.setBasicConfig = setBasicConfig;

        this.configureExpress();

        this.initializeDatabases();

        this.initializeServices();

        this.initializeRoutes();
        this.initializeErrorHandling();
        this.initializeSwaggerApp();
    }

    private configureExpress(): void {
        if (this.setBasicConfig) {
            this.app.use(express.json({ limit: '50mb' }));
            this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
            this.app.use(cors());
        }

        this.app.set('trust proxy', 1);
    }

    private initializeDatabases(): void {
        if (process.env.DB_HOST) {
            try {
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
    }

    private initializeSwaggerApp(): void {
        initializeSwagger(this.app);
    }

    private initializeErrorHandling(): void {
        this.app.use(ErrorHandlerMiddleware);
    }
}

export default new App().app;

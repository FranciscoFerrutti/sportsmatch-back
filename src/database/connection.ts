import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

let sequelize: Sequelize;

if(process.env.IS_LOCAL == "true"){
    sequelize = new Sequelize({
        database: process.env.DB_NAME!,
        dialect: 'postgres',
        username: process.env.DB_USER!,
        password: process.env.DB_PASS!,
        host: process.env.DB_HOST!,
        port: +(process.env.DB_PORT ?? 5433),
        storage: ':memory:',
        models: [__dirname + '/models'],
    });
} else {
    if (!process.env.DATABASE_URL) {
        throw new Error("❌ DATABASE_URL is not set in environment variables.");
    }

    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        models: [path.join(__dirname, "./models")],
        logging: console.log,
    });
}

export default sequelize;

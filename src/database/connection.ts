import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

let sequelize: Sequelize;

if(process.env.IS_LOCAL == "true"){
    console.log("Using port Number: " + (process.env.DB_PORT));
    console.log(__dirname + '/models');
    sequelize = new Sequelize({
        database: process.env.DB_NAME!,
        dialect: 'postgres',
        username: process.env.DB_USER!,
        password: process.env.DB_PASS!,
        host: process.env.DB_HOST!,
        port: +(process.env.DB_PORT ?? 5433),
        models: [__dirname + '/models'],
        sync: { force: process.env.DB_SYNC_FORCE === "true" },
        logging: console.log,
    });
} else {
    if (!process.env.DATABASE_URL) {
        throw new Error("❌ DATABASE_URL is not set in environment variables.");
    }
    console.log("Loading models from:", path.join(__dirname, "./models"));
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        models: [path.join(__dirname, "./models")],
        sync: { force: true },
        logging: console.log,
        define: {
            schema: 'public',
        },
        schema: 'public',
    });
    console.log("Loaded models:", sequelize.modelManager.all.map(m => m.name));
    console.log("Auth table name:", sequelize.model('Auth').getTableName());
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to Supabase has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

export default sequelize;

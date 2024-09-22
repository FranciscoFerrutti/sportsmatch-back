import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
    database: process.env.DB_NAME!,
    dialect: 'postgres',
    username: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    host: process.env.DB_HOST!,
    port: +(process.env.DB_PORT ?? 5433),
    storage: ':memory:',
    models: [__dirname + '/models'],
});

export default sequelize;
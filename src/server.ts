import * as dotenv from 'dotenv';
dotenv.config();

import app from './app';

app.listen(+(process.env.PORT ?? 8080), process.env.LAN_HOST ?? "localhost",  
    () => console.log(`${process.env.NAME!} up and running in ${process.env.LAN_HOST ?? "localhost"}:${+(process.env.PORT ?? 8080)}`));

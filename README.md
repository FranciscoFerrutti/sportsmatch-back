# SportsMatch App

A sports matching application developed by Gastón De Schant, Agustin Naso, and Brittany Lin.

## About

SportsMatch is an application that helps people find sports partners and matches based on their preferences and location.

## Setup

To run the SportsMatch application, follow these steps:

1. Install the required dependencies using:

`npm install`

2. Create a `.env` file in the root directory of the project.

3. Configure the following environment variables in the `.env` file:

- `DB_USER`: The username for the database. (e.g., DB_USER=sportsmatch)
- `DB_HOST`: The host address of the database server. (e.g., DB_HOST=localhost)
- `DB_NAME`: The name of the database to be used. (e.g., DB_NAME=sportsmatchdb)
- `DB_PASS`: The password for the database user. (e.g., DB_PASS=password)
- `DB_PORT`: The port number on which the database server is running. (e.g., DB_PORT=5432)
- `LAN_HOST`: The local network host address for the application. (e.g., LAN_HOST=192.168.xx.xx)
- `NAME`: The name of the application. (e.g., NAME=SportsMatch)
- `PORT`: The port number on which the application will run. (e.g., PORT=8080)
- `IS_LOCAL`: A boolean value that indicates whether the application is running locally. (e.g., IS_LOCAL=true)

## Environment Variable Explanations

- `DB_USER`: This is the username that the application will use to authenticate and connect to the database.

- `DB_HOST`: This is the hostname or IP address of the machine where your database server is running. For local development, it's often set to 'localhost'.

- `DB_NAME`: This is the name of the database that the application will use. The application will perform operations within this database.

- `DB_PASS`: This is the password associated with the database user specified by `DB_USER`. It's used to authenticate and gain access to the database.

- `DB_PORT`: This is the port number on which the database server is listening. PostgreSQL's default port is 5432, but you mentioned 5433 in your configuration.

- `LAN_HOST`: This is the local network IP address of the machine where your application will run. This is used to bind the server to a specific network interface. It's important to note that this IP should be reachable within your local network.

## Usage

1. Run the application using:

`npm run dev`

2. Access the application using the URL provided in the console.

## Deploy

To deploy the SportsMatch application, follow these steps:

1. run the following command to create the image:

`docker build . -t sportmatch_img`

2. run the following command to create the container:

`docker run -p 8080:8080 -t sportmatch_img`

## Credits

This application was developed by Gastón De Schant, Agustin Naso, and Brittany Lin.

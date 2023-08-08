# Baileys Mongo

## Package made by mrodriguezbegueri for using mongodb to store auth sessions from Baileys package
## This package was inspired from baileys-bottle package made by deadlinecode.

Descripción

## Installation

1. Install the package

    ```bash
    npm i baileys-mongo
    ```

2. Generate prisma scheme. For this create one folder named "prisma" with one file called "shceme.prisma". The file has to be like this:

    ```bash
    datasource db {
    provider = "mongodb"
    url      = env("MONGO_DB_URL")
    }

    generator client {
    provider = "prisma-client-js"
    }


    model Auth {
    id          String  @id @default(auto()) @map("_id") @db.ObjectId
    key       String @unique
    value String
    }
    ```

4. Set an env var named "MONGO_DB_URL" with the url of your mongo database. Prisma client request to set a replica for upsert operations

    ```bash
    MONGO_DB_URL=mongodb+srv://USER:PASSWORD@CLUSTERXXXX.XXXX.mongodb.net/sessions?retryWrites=true&w=majority
    ```
5. Run prisma generate command

    ```bash
    npx prisma generate --schema=./prisma/scheme.prisma
    ```

## Usage

Take a look at the information in the [example folder](https://github.com/mrodriguezbegueri/baileys-mongo/blob/main/src/example/example.ts)

## I wanna tweak it for my own use case

Sure thing! You can tinker with the package like this:

1. Clone the repo
   ```bash
   git clone https://github.com/deadlinecode/baileys-bottle .
   ```
2. Change stuff you wanna change
3. Build the package
   ```bash
   npm build
   ```
4. Install it in another nodejs project from wherever you saved it on your disk
   ```bash
   # inside your other project
   npm install /path/to/the/repo/named/baileys-bottle
   ```
   or alternatively run the example
   ```bash
   # inside the package folder
   npm run example
   ```

## You need help or want to exchange about things

Send me an email to mrodriguezbegueri@gmail.com
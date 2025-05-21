const express = require('express');
const { program } = require ('commander');
require('dotenv').config()
const pgp = require('pg-promise')()
const db = pgp({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

program
    .option('-h, --host <address>')
    .option('-p, --port <number>')

program.parse();
const options = program.opts();

if (!options.port) {
    console.log('Please, specify port');
    return;
}

if (!options.host) {
    console.log('Please, specify host');
    return;
}

const app = express();

app.use(express.json())

app.post("/register", async (req, res) => {
    const device_name = req.body.device_name;
    const serial_number = req.body.serial_number;

    const existing = await db.oneOrNone(
        'SELECT * FROM devices WHERE serial_number = $1',
        [serial_number]
    );

    if(existing) {
        res.sendStatus(400);
        return;
    }

    await db.none(
        'INSERT INTO devices (device_name, serial_number) VALUES ($1, $2)',
        [device_name, serial_number]
    );

    res.sendStatus(200);

});

app.get("/devices", async (req, res) => {

    const devices = await db.any('SELECT device_name, serial_number FROM devices');

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(devices);
});

app.post("/take", async (req, res) => {
     const user_name = req.body.user_name;
     const serial_number = req.body.serial_number;

    const name = await db.oneOrNone(
        'SELECT user_name FROM devices WHERE serial_number = $1',
        [serial_number]
    );

    if(!name) {
        res.sendStatus(404);
        return;
    }

    if(name.user_name !== null) {
        res.sendStatus(400);
        return;
    }

    await db.none(
        'UPDATE devices SET user_name = $1 WHERE serial_number = $2',
        [user_name, serial_number]
    );

    res.sendStatus(200);
});


app.get("/devices/:serial_number", async (req, res) => {
    const serial_number = req.params.serial_number;

    const data = await db.oneOrNone(
        'SELECT user_name, device_name FROM devices WHERE serial_number = $1',
        [serial_number]
    );

    if(!data){
        res.sendStatus(404);
        return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data);
});

app.patch("/return", async (req, res) => {
    const serial_number = req.body.serial_number;

    const data = await db.oneOrNone(
        'select user_name from devices where serial_number = $1',
        [serial_number]
    );

    if(!data){
        res.sendStatus(404);
        return;
    }

    if(data.user_name === null) {
        res.sendStatus(400);
        return;
    }

    db.none(
        'update devices set user_name = null where serial_number = $1',
        [serial_number]
    );
    res.sendStatus(200);
});


app.listen(options.port, options.host, () => {
    console.log(`Server is running on port ${options.port}`)
});
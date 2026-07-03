const express = require('express');
const app = express();
require('dotenv').config();
const main = require('./config/db');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.json());

main().then(() => {
app.listen(process.env.PORT, () => {
    console.log('server running at port', process.env.PORT);
});
}).catch((err) => {
    console.log('Failed to connect to the database', err);
});
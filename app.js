if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}// this code will always run in develpment mode

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const drawingsRoutes = require('./routes/drawings-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json({ limit: '10mb' }));

app.use(cookieParser());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, PUT'
    );
    next();
});

// app.use(cors({
//     allowedHeaders: "*",
//     allowMethods: "*",
//     origin: "*"
// }))

app.use('/api/drawings', drawingsRoutes);
app.use('/api/users', usersRoutes);

//unsupport routes error handling middleware which will only reach if some req above didn't get a response back.
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404);
    throw error;
});

//express error handler middleware function
app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!' });
})

mongoose
    .connect(process.env.DB_URL)
    .then(() => {
        app.listen(5000);
    })
    .catch(err => {
        console.log(err);
    });




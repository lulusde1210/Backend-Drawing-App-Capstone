const express = require('express');
const bodyParser = require('body-parser');

const drawingsRoutes = require('./routes/drawings-routes');

const app = express();

app.use('/api/drawings', drawingsRoutes);

//express error handler middleware function
app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknow error occurred!' });
})

app.listen(5000);
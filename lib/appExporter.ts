import config from '@/config';
import express from 'express';
import helmet from 'helmet';
import applyConfig from './applyConfig';
import serverEvents from './eventEmitters/serverEvents';


const app = express();


// apply middleware
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(express.text());
app.use(express.raw());
app.use(helmet());


serverEvents.emit('start:applyConfig', config);
// apply app configuration
applyConfig(config, app);
serverEvents.emit('end:applyConfig', config);


// === BOILERPLATE ===
// Catch and send error messages except 404
// app.use((req, res, next) => {
//     if (err) {
//         console.error(err.message)
//         if (!err.statusCode) {
//             // Set 500 server code error if statuscode not set
//             err.statusCode = 500
//         }
//         return res.status(err.statusCode).json({
//             status: err.statusCode,
//             message: err.message
//         })
//     }

//     next();
// })


// catch 404
app.use(function (req, res, next) {
    const code = 404;
    const err = new Error();
    err.name = `${code}`;
    err.message = 'The requested resource does not exist';
    res.status(404).json({
        status: err.message
    });
});


export default app;

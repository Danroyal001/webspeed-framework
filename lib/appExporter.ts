import config from '../config';
import express from 'express';
import helmet from 'helmet';
import applyConfig from './applyConfig';
import serverEvents from './eventEmitters/serverEvents';


const app = express();


// begin pre-request handlr
app.use((req, res, next) => {
    console.time('response-time');
    serverEvents.emit('start:handleRequest');

    res.setHeader('Content-Type', 'text/html');

    console.log(`\n${req.method.toUpperCase()} request to ${req.originalUrl} from IP ${req.ip} at time: ${new Date}\n`);

    return next();
});
// end pre-request handler


app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(express.text());
app.use(express.raw());
app.use(helmet());


serverEvents.emit('start:applyConfig', config, app);
// apply app configuration
applyConfig(config, app);
serverEvents.emit('end:applyConfig', config, app);


// handle static files
app.use('statuc', express.static('../frontend/static'));
// end handle static files


// begin handle 404 error
app.get('/404', (req, res, next) => {
    serverEvents.emit('start:404', req, res, next);

    const err = new Error('404');
    res.status(404).send('404 - Resource not found');

    serverEvents.emit('end:404', req, res);

    console.timeEnd('response-time');
    return next(err);
});
app.use((_, res, next) => {
    res.redirect(302, '/404');
    return next();
});
// end handle 404 error


export default app;

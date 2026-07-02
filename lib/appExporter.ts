import config from '../config';
import express from 'express';
import helmet from 'helmet';
import * as path from 'path';
import applyConfig from './applyConfig';
import serverEvents from './eventEmitters/serverEvents';


const app = express();


// begin pre-request handler
app.use((req, res, next) => {
    serverEvents.emit('start:handleRequest');

    console.log(`\n${req.method.toUpperCase()} request to ${req.originalUrl} from IP ${req.ip} at time: ${new Date()}\n`);

    return next();
});
// end pre-request handler


app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(express.text());
app.use(express.raw());
app.use(helmet({
    contentSecurityPolicy: false // Disable CSP for easy development and examples rendering
}));

// Serve static assets from 'public/' directory in project root
app.use(express.static(path.resolve(process.cwd(), 'public')));

serverEvents.emit('start:applyConfig', config, app);
// apply app configuration
applyConfig(config, app);
serverEvents.emit('end:applyConfig', config, app);


// begin handle 404 error
app.get('/404', (req, res, next) => {
    serverEvents.emit('start:404', req, res, next);

    res.status(404).send('404 - Resource not found');

    serverEvents.emit('end:404', req, res);
});
app.use((req, res, next) => {
    // If request has not been sent yet, redirect to 404
    if (!res.headersSent) {
        return res.redirect(302, '/404');
    }
    return next();
});
// end handle 404 error


export default app;


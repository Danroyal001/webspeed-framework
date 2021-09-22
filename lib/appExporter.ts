import config from '../config';
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



// begin handle 404 error
app.get('/404', (req, res, next) => {
    serverEvents.emit('start:404', req, res, next);
    const err = new Error('404');
    res.status(404).send('Resource not found');
    next(err);
    serverEvents.emit('end:404', req, res, next);
});
app.use((_, res) => {
    return res.redirect(302, '/404');
});
// end handle 404 error



export default app;

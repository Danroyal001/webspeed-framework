import config from '@/config';
import express from 'express';
import helmet from 'helmet';
import applyConfig from './applyConfig';
import serverEvents from './eventEmitters/serverEvents';


const app = express();


app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(express.text());
app.use(express.raw());
app.use(helmet());


// handle 404 error
app.use((req, res, next) => {
    const err = new Error('404');
    res.send('Route not found')
    next(err);
});


serverEvents.emit('start:applyConfig', config);
// apply app configuration
applyConfig(config, app);
serverEvents.emit('end:applyConfig', config);


export default app;

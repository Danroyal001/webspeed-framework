import express from 'express';
import config from '../config';
import serverEvents from './eventEmitters/serverEvents';
import applyConfig from './applyConfig';

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(express.text());
app.use(express.raw());


serverEvents.emit('start:applyConfig');
applyConfig(config, app);
serverEvents.emit('end:applyConfig');

export default app;

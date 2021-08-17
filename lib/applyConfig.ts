import express from "express";
import serverEvents from "./eventEmitters/serverEvents";
import { io } from "./httpServerExporter";
import applyRoutes from './applyRoutes';
import PORT from "@/PORT";
import routingControllers from './routingControllers/index';

const applyConfig = (config: Record<string, any>, app: express.Express) => {
    
    app.set('io', io);
    app.set('PORT', PORT);

    serverEvents.emit('start:applyRoutes');
    // apply app routing
    applyRoutes(app, routingControllers);
    serverEvents.emit('end:applyRoutes');

};

export default applyConfig;

import express from "express";
import RoutingController from './routingControllers/RoutingController';

const applyRoutes = (app: express.Express, routingControllers: RoutingController[]) => {
    routingControllers.forEach(controller => {
        app.use(controller.slug, controller.router);
    });
}

export default applyRoutes;

import RoutingController from "./RoutingController";
import ctrl from './CustomController';
import taskApiController from './TaskApiController';
import blogController from './BlogController';

let routingControllers: RoutingController[] = [
    ctrl,
    taskApiController,
    blogController
];

export default routingControllers;


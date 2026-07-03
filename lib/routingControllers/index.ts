import RoutingController from "./RoutingController";
import ctrl from './CustomController';
import taskApiController from './TaskApiController';
import blogController from '../../examples/cms-blog/BlogController';
import collabController from '../../examples/collab-board/CollabController';
import storeController from '../../examples/store-catalog/StoreController';
import authController from './AuthController';
import adminController from './AdminController';
import premiumShowcaseController from '../../examples/premium-showcase/PremiumShowcaseController';

let routingControllers: RoutingController[] = [
    ctrl,
    taskApiController,
    blogController,
    collabController,
    storeController,
    authController,
    adminController,
    premiumShowcaseController
];

export default routingControllers;



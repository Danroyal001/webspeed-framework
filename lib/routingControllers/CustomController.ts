import RoutingController from './RoutingController'
import { RouteContext } from './RoutingController';

class CustomController extends RoutingController {
    constructor(){
        super('/');
    }

    get(context: RouteContext){
        context.setHeader('Content-Type', 'text/html');
        context.setResponsePayload('<strong>Hello ctrl!</strong>');

        return context.finish();
    }
}

const ctrl = new CustomController;

export default ctrl;

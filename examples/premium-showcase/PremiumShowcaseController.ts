import RoutingController, { RouteContext } from '../../lib/routingControllers/RoutingController';
import Product from '../../database/databaseModels/Product';

class PremiumShowcaseController extends RoutingController {
    constructor() {
        super('/premium-showcase');
    }

    // Serve the Premium Showcase HTML page
    async get(context: RouteContext) {
        // Count database products dynamically to showcase ActiveRecord status
        const productsCount = await Product.query().get();

        return context.render('examples/premium-showcase/index.html', {
            title: 'WebSpeed Features Showcase Portal',
            productsCount: productsCount.length
        });
    }
}

export default new PremiumShowcaseController();

import RoutingController, { RouteContext } from '../../lib/routingControllers/RoutingController';
import Product from '../../database/databaseModels/Product';

class StoreController extends RoutingController {
    constructor() {
        super('/store');

        // Products API endpoint: GET /store/api/products
        this.router.get('/api/products', (req, res, next) => {
            this.getProducts(new RouteContext(req, res, next));
        });
    }

    // Serve the E-Commerce Store catalog page
    async get(context: RouteContext) {
        return context.render('examples/store-catalog/index.html', {
            title: 'WebSpeed E-Commerce Product Catalog'
        });
    }

    // JSON API for products catalog
    async getProducts(context: RouteContext) {
        try {
            let query = Product.query();
            const category = context.getQueryParam('category');
            if (category) {
                query = query.where('category', String(category));
            }

            let list = await query.get();

            // Support text search query param in-memory for database-agnostic matching
            const search = context.getQueryParam('search');
            if (search) {
                const term = String(search).toLowerCase();
                list = list.filter(p => 
                    (p.name && p.name.toLowerCase().includes(term)) || 
                    (p.description && p.description.toLowerCase().includes(term))
                );
            }

            return context.json(list);
        } catch (error: any) {
            return context.json({ error: error.message }, 500);
        }
    }
}

export default new StoreController();

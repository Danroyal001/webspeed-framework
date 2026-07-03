import DatabaseModel from './DatabaseModel';
import { ModelSchema } from '../schema';

class Product extends DatabaseModel {
    readonly __collection: string = 'products';

    static schema: ModelSchema = {
        name: { type: 'string', required: true },
        description: { type: 'string' },
        price: { type: 'number', required: true, default: 0.0 },
        category: { type: 'string', required: true },
        image: { type: 'string' }
    };

    declare name: string;
    declare description: string;
    declare price: number;
    declare category: string;
    declare image: string;
}

export default Product;

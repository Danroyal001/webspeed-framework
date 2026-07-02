import DatabaseModel from './DatabaseModel';

class Product extends DatabaseModel {
    readonly __collection: string = 'products';

    declare name: string;
    declare description: string;
    declare price: number;
    declare category: string;
    declare image: string;
}

export default Product;

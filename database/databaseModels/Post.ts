import DatabaseModel from './DatabaseModel';

class Post extends DatabaseModel {
    readonly __collection: string = 'posts';

    declare title?: string;
    declare content?: string;
    declare slug?: string;
}

export default Post;

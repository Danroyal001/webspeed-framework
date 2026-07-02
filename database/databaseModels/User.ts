import DatabaseModel from './DatabaseModel';

class User extends DatabaseModel {
    readonly __collection: string = 'users';
}

export default User;


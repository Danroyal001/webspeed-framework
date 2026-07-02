import DatabaseModel from './DatabaseModel';

class Message extends DatabaseModel {
    readonly __collection: string = 'messages';

    declare username: string;
    declare text: string;
    declare timestamp: string;
}

export default Message;

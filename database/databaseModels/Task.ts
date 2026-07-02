import DatabaseModel from './DatabaseModel';

class Task extends DatabaseModel {
    readonly __collection: string = 'tasks';

    declare title?: string;
    declare description?: string;
    declare completed?: boolean;
}

export default Task;

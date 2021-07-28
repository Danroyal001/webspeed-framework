export interface DatabaseModelParams {
}

class DatabaseModel {
    readonly __collection: string = 'collectionNameOrDatabaseName';
    private privateValue?: string;

    constructor(params: DatabaseModelParams) {
        const keys = Object.keys(params);
        keys.forEach(key => {
            this[key] = params[key];
        });

        return this;

    }

    async __saveToDatabase() {
        try {
            return true;
        } catch (error) {
            console.error(error);

            return false;
        }
    }

    __set(key: string, value: any) {
        // 
    }

    __get(key: string) {
        // 
    }

    static async __loadFromDatabase(queryArgs) {
        // 
    }

    static fromObject(params: DatabaseModelParams) {
        return new this(params);
    }

    toString() {
        return '[object DatabaseModelParams]';
    }

    static toString() {
        return '[object DatabaseModelParams]';
    }
}

export default DatabaseModel;

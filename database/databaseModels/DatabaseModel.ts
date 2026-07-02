import dbConnection from '../connection';
import DatabaseQueryBuilder from '../DatabaseQueryBuilder';

export interface DatabaseModelParams {
    [key: string]: any;
}

class DatabaseModel {
    [key: string]: any;
    readonly __collection: string = 'models';

    constructor(params: DatabaseModelParams) {
        const keys = Object.keys(params);
        keys.forEach(key => {
            this[key] = params[key];
        });
        return this;
    }

    async __saveToDatabase(): Promise<boolean> {
        try {
            const driver = dbConnection.getDriver();
            const data: Record<string, any> = {};
            
            // Gather all normal properties (exclude functions, __ properties)
            Object.keys(this).forEach(key => {
                if (typeof this[key] !== 'function' && !key.startsWith('__')) {
                    data[key] = this[key];
                }
            });

            let savedRecord: any;
            if (this.id) {
                // If it already has an ID, perform an update or rewrite
                const exists = await driver.read(this.__collection, { id: this.id });
                if (exists.length > 0) {
                    await driver.update(this.__collection, { id: this.id }, data);
                    savedRecord = { ...data, updatedAt: new Date().toISOString() };
                } else {
                    savedRecord = await driver.write(this.__collection, data);
                }
            } else {
                savedRecord = await driver.write(this.__collection, data);
            }

            // Sync updated properties back to instance
            if (savedRecord) {
                Object.keys(savedRecord).forEach(key => {
                    this[key] = savedRecord[key];
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error saving model to database:', error);
            return false;
        }
    }

    async __deleteFromDatabase(): Promise<boolean> {
        if (!this.id) return false;
        try {
            const driver = dbConnection.getDriver();
            return await driver.delete(this.__collection, { id: this.id });
        } catch (error) {
            console.error('Error deleting model from database:', error);
            return false;
        }
    }

    __set(key: string, value: any) {
        this[key] = value;
    }

    __get(key: string) {
        return this[key];
    }

    static query<T extends DatabaseModel>(this: new (params: any) => T): DatabaseQueryBuilder<T> {
        const instance = new this({});
        return new DatabaseQueryBuilder<T>(instance.__collection, this);
    }

    static async __loadFromDatabase(queryArgs: any): Promise<DatabaseModel[]> {
        const instance = new this({});
        const driver = dbConnection.getDriver();
        const records = await driver.read(instance.__collection, queryArgs);
        return records.map(record => this.fromObject(record));
    }

    static fromObject(params: DatabaseModelParams) {
        return new this(params);
    }

    toString() {
        return `[object DatabaseModel(${this.__collection})]`;
    }

    static toString() {
        return '[object DatabaseModel]';
    }
}

export default DatabaseModel;


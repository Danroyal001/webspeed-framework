import dbConnection from './connection';
import DatabaseModel from './databaseModels/DatabaseModel';

class DatabaseQueryBuilder<T extends DatabaseModel> {
    private collectionName: string;
    private modelClass: new (params: any) => T;
    private queryObj: Record<string, any> = {};
    private limitVal?: number;
    private offsetVal?: number;

    constructor(collectionName: string, modelClass: new (params: any) => T) {
        this.collectionName = collectionName;
        this.modelClass = modelClass;
    }

    where(field: string, value: any): this {
        this.queryObj[field] = value;
        return this;
    }

    limit(num: number): this {
        this.limitVal = num;
        return this;
    }

    offset(num: number): this {
        this.offsetVal = num;
        return this;
    }

    async get(): Promise<T[]> {
        const driver = dbConnection.getDriver();
        const records = await driver.read(this.collectionName, this.queryObj, {
            limit: this.limitVal,
            offset: this.offsetVal
        });
        return records.map(record => {
            // Instantiate using fromObject or standard constructor
            return (this.modelClass as any).fromObject(record) as T;
        });
    }

    async first(): Promise<T | null> {
        const results = await this.limit(1).get();
        return results.length > 0 ? results[0] : null;
    }

    async update(data: any): Promise<boolean> {
        const driver = dbConnection.getDriver();
        return await driver.update(this.collectionName, this.queryObj, data);
    }

    async delete(): Promise<boolean> {
        const driver = dbConnection.getDriver();
        return await driver.delete(this.collectionName, this.queryObj);
    }
}

export default DatabaseQueryBuilder;


import { MongoClient, Db } from 'mongodb';
import DatabaseDriver from '../DatabaseDriver';

class MongoDbDriver extends DatabaseDriver {
    private client: MongoClient;
    private dbName: string;
    private db?: Db;

    constructor(config?: { uri?: string; dbName?: string }) {
        super();
        const uri = config?.uri || process.env.MONGO_URI || 'mongodb://localhost:27017';
        this.dbName = config?.dbName || process.env.MONGO_DB || 'webspeed';
        this.client = new MongoClient(uri);
    }

    async connect(): Promise<void> {
        await this.client.connect();
        this.db = this.client.db(this.dbName);
    }

    async disconnect(): Promise<void> {
        await this.client.close();
    }

    private getDb(): Db {
        if (!this.db) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.db;
    }

    private mapId(doc: any): any {
        if (!doc) return doc;
        const { _id, ...rest } = doc;
        return { id: _id?.toString() || doc.id, ...rest };
    }

    private mapQuery(query: any): any {
        if (!query) return {};
        const mapped = { ...query };
        if (mapped.id) {
            mapped._id = mapped.id;
            delete mapped.id;
        }
        return mapped;
    }

    async read(collection: string, query?: any, options?: { limit?: number; offset?: number }): Promise<any[]> {
        const col = this.getDb().collection(collection);
        const mappedQuery = this.mapQuery(query);
        let cursor = col.find(mappedQuery);
        if (options?.offset) {
            cursor = cursor.skip(options.offset);
        }
        if (options?.limit) {
            cursor = cursor.limit(options.limit);
        }
        const docs = await cursor.toArray();
        return docs.map(this.mapId);
    }

    async write(collection: string, data: any): Promise<any> {
        const col = this.getDb().collection(collection);
        const record = {
            ...data,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        if (record.id) {
            record._id = record.id;
            delete record.id;
        }
        const result = await col.insertOne(record);
        return {
            id: result.insertedId.toString(),
            ...data,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        };
    }

    async update(collection: string, query: any, data: any): Promise<boolean> {
        const col = this.getDb().collection(collection);
        const mappedQuery = this.mapQuery(query);
        const updateDoc = {
            $set: {
                ...data,
                updatedAt: new Date().toISOString()
            }
        };
        const result = await col.updateMany(mappedQuery, updateDoc);
        return result.modifiedCount > 0;
    }

    async delete(collection: string, query: any): Promise<boolean> {
        const col = this.getDb().collection(collection);
        const mappedQuery = this.mapQuery(query);
        const result = await col.deleteMany(mappedQuery);
        return (result.deletedCount ?? 0) > 0;
    }
}

export default MongoDbDriver;


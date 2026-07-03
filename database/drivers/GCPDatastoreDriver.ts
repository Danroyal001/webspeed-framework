import DatabaseDriver from '../DatabaseDriver';

class GCPDatastoreDriver extends DatabaseDriver {
    async connect(): Promise<void> {}
    async disconnect(): Promise<void> {}

    async read(collection: string, query?: any, options?: any): Promise<any[]> {
        return [];
    }

    async write(collection: string, data: any): Promise<any> {
        return data;
    }

    async update(collection: string, query: any, data: any): Promise<boolean> {
        return true;
    }

    async delete(collection: string, query: any): Promise<boolean> {
        return true;
    }

    async listCollections(): Promise<string[]> {
        return [];
    }
}

export default GCPDatastoreDriver;


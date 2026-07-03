import * as fs from 'fs';
import * as path from 'path';
import DatabaseDriver from '../DatabaseDriver';

class DiskStorageDriver extends DatabaseDriver {
    private dbDir: string;

    constructor(config?: { dbDir?: string }) {
        super();
        this.dbDir = path.resolve(process.cwd(), config?.dbDir || 'db_data');
    }

    async connect(): Promise<void> {
        if (!fs.existsSync(this.dbDir)) {
            fs.mkdirSync(this.dbDir, { recursive: true });
        }
    }

    async disconnect(): Promise<void> {
        // No-op for disk storage
    }

    private getFilePath(collection: string): string {
        return path.join(this.dbDir, `${collection}.json`);
    }

    private async readCollection(collection: string): Promise<any[]> {
        const filePath = this.getFilePath(collection);
        if (!fs.existsSync(filePath)) {
            return [];
        }
        try {
            const data = await fs.promises.readFile(filePath, 'utf-8');
            return JSON.parse(data || '[]');
        } catch (error) {
            console.error(`Error reading collection ${collection}:`, error);
            return [];
        }
    }

    private async writeCollection(collection: string, data: any[]): Promise<void> {
        const filePath = this.getFilePath(collection);
        await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    }

    private matches(item: any, query: any): boolean {
        if (!query) return true;
        return Object.keys(query).every(key => item[key] === query[key]);
    }

    async read(collection: string, query?: any, options?: { limit?: number; offset?: number }): Promise<any[]> {
        let items = await this.readCollection(collection);
        if (query) {
            items = items.filter(item => this.matches(item, query));
        }
        const offset = options?.offset || 0;
        const limit = options?.limit;
        items = items.slice(offset);
        if (limit !== undefined) {
            items = items.slice(0, limit);
        }
        return items;
    }

    async write(collection: string, data: any): Promise<any> {
        const items = await this.readCollection(collection);
        const record = {
            id: data.id || `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
            ...data,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        items.push(record);
        await this.writeCollection(collection, items);
        return record;
    }

    async update(collection: string, query: any, data: any): Promise<boolean> {
        const items = await this.readCollection(collection);
        let updated = false;
        const newItems = items.map(item => {
            if (this.matches(item, query)) {
                updated = true;
                return {
                    ...item,
                    ...data,
                    updatedAt: new Date().toISOString()
                };
            }
            return item;
        });
        if (updated) {
            await this.writeCollection(collection, newItems);
        }
        return updated;
    }

    async delete(collection: string, query: any): Promise<boolean> {
        const items = await this.readCollection(collection);
        const initialLength = items.length;
        const newItems = items.filter(item => !this.matches(item, query));
        if (newItems.length < initialLength) {
            await this.writeCollection(collection, newItems);
            return true;
        }
        return false;
    }

    async listCollections(): Promise<string[]> {
        if (!fs.existsSync(this.dbDir)) return [];
        return fs.readdirSync(this.dbDir)
            .filter(file => file.endsWith('.json'))
            .map(file => file.replace('.json', ''));
    }
}

export default DiskStorageDriver;


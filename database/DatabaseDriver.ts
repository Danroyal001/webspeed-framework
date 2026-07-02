abstract class DatabaseDriver {
    constructor(config?: any) {}
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract read(collection: string, query?: any, options?: { limit?: number; offset?: number }): Promise<any[]>;
    abstract write(collection: string, data: any): Promise<any>;
    abstract delete(collection: string, query: any): Promise<boolean>;
    abstract update(collection: string, query: any, data: any): Promise<boolean>;
}

export default DatabaseDriver;


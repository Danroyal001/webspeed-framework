abstract class DatabaseDriver {
    constructor(config?: any) {}
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract read(collection: string, query?: any, options?: any): Promise<any[]>;
    abstract write(collection: string, data: any, options?: any): Promise<any>;
    abstract delete(collection: string, query: any, options?: any): Promise<boolean>;
    abstract update(collection: string, query: any, data: any, options?: any): Promise<boolean>;
    abstract listCollections(): Promise<string[]>;
}

export default DatabaseDriver;


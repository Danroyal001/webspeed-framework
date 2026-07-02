import mysql from 'mysql2/promise';
import DatabaseDriver from '../DatabaseDriver';

class MySqlDriver extends DatabaseDriver {
    private pool?: mysql.Pool;
    private config: any;

    constructor(config?: any) {
        super();
        this.config = {
            host: config?.host || process.env.MYSQL_HOST || 'localhost',
            user: config?.user || process.env.MYSQL_USER || 'root',
            password: config?.password || process.env.MYSQL_PASSWORD || '',
            database: config?.database || process.env.MYSQL_DATABASE || 'webspeed',
            port: Number(config?.port || process.env.MYSQL_PORT || 3306),
            ...config
        };
    }

    async connect(): Promise<void> {
        // Create pool without database first to ensure database exists
        const connection = await mysql.createConnection({
            host: this.config.host,
            user: this.config.user,
            password: this.config.password,
            port: this.config.port
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${this.config.database}\``);
        await connection.end();

        this.pool = mysql.createPool(this.config);
    }

    async disconnect(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
        }
    }

    private getPool(): mysql.Pool {
        if (!this.pool) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.pool;
    }

    private async ensureTable(table: string): Promise<void> {
        const pool = this.getPool();
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`${table}\` (
                id VARCHAR(255) PRIMARY KEY,
                data JSON,
                createdAt VARCHAR(255),
                updatedAt VARCHAR(255)
            )
        `);
    }

    async read(collection: string, query?: any, options?: { limit?: number; offset?: number }): Promise<any[]> {
        await this.ensureTable(collection);
        const pool = this.getPool();

        let sql = `SELECT * FROM \`${collection}\``;
        const params: any[] = [];

        if (query && Object.keys(query).length > 0) {
            const conditions = Object.keys(query).map(key => {
                if (key === 'id') {
                    params.push(query[key]);
                    return `id = ?`;
                }
                params.push(query[key]);
                return `JSON_UNQUOTE(JSON_EXTRACT(data, '$.${key}')) = ?`;
            });
            sql += ` WHERE ` + conditions.join(' AND ');
        }

        if (options?.limit !== undefined) {
            sql += ` LIMIT ?`;
            params.push(options.limit);
            if (options?.offset !== undefined) {
                sql += ` OFFSET ?`;
                params.push(options.offset);
            }
        }

        const [rows] = await pool.query(sql, params);
        const results = rows as any[];
        return results.map(row => {
            const parsedData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
            return {
                id: row.id,
                ...parsedData,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt
            };
        });
    }

    async write(collection: string, data: any): Promise<any> {
        await this.ensureTable(collection);
        const pool = this.getPool();

        const id = data.id || `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
        const record = {
            ...data,
            id,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const { id: _, createdAt, updatedAt, ...rest } = record;
        await pool.query(
            `INSERT INTO \`${collection}\` (id, data, createdAt, updatedAt) VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE data = VALUES(data), updatedAt = VALUES(updatedAt)`,
            [id, JSON.stringify(rest), createdAt, updatedAt]
        );

        return record;
    }

    async update(collection: string, query: any, data: any): Promise<boolean> {
        await this.ensureTable(collection);
        const pool = this.getPool();

        // Retrieve existing records to merge update fields
        const records = await this.read(collection, query);
        if (records.length === 0) return false;

        for (const record of records) {
            const merged = {
                ...record,
                ...data,
                updatedAt: new Date().toISOString()
            };
            const { id, createdAt, updatedAt, ...rest } = merged;
            await pool.query(
                `UPDATE \`${collection}\` SET data = ?, updatedAt = ? WHERE id = ?`,
                [JSON.stringify(rest), updatedAt, id]
            );
        }
        return true;
    }

    async delete(collection: string, query: any): Promise<boolean> {
        await this.ensureTable(collection);
        const pool = this.getPool();

        let sql = `DELETE FROM \`${collection}\``;
        const params: any[] = [];

        if (query && Object.keys(query).length > 0) {
            const conditions = Object.keys(query).map(key => {
                if (key === 'id') {
                    params.push(query[key]);
                    return `id = ?`;
                }
                params.push(query[key]);
                return `JSON_UNQUOTE(JSON_EXTRACT(data, '$.${key}')) = ?`;
            });
            sql += ` WHERE ` + conditions.join(' AND ');
            const [result] = await pool.query(sql, params);
            return (result as any).affectedRows > 0;
        } else {
            // Do not allow deleting entire table without query for safety
            throw new Error('Delete query must specify filter parameters.');
        }
    }
}

export default MySqlDriver;


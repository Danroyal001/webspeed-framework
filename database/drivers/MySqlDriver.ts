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

    private async ensureTable(table: string, schema?: any): Promise<void> {
        const pool = this.getPool();
        if (schema) {
            await this.syncSchema(table, schema);
            return;
        }
        await pool.query(`
            CREATE TABLE IF NOT EXISTS \`${table}\` (
                id VARCHAR(255) PRIMARY KEY,
                data JSON,
                createdAt VARCHAR(255),
                updatedAt VARCHAR(255)
            )
        `);
    }

    private async syncSchema(table: string, schema: any): Promise<void> {
        const pool = this.getPool();
        const [tables]: any = await pool.query(`SHOW TABLES LIKE ?`, [table]);
        if (tables.length === 0) {
            const columnsDef: string[] = ['\`id\` VARCHAR(255) PRIMARY KEY'];
            Object.keys(schema).forEach(key => {
                if (key === 'id') return;
                const field = schema[key];
                let dbType = 'VARCHAR(255)';
                if (field.type === 'number') dbType = 'DOUBLE';
                else if (field.type === 'boolean') dbType = 'TINYINT(1)';
                else if (field.type === 'json') dbType = 'JSON';
                else if (field.type === 'text') dbType = 'TEXT';
                columnsDef.push(`\`${key}\` ${dbType}`);
            });
            columnsDef.push('\`createdAt\` VARCHAR(255)', '\`updatedAt\` VARCHAR(255)');
            
            await pool.query(`CREATE TABLE \`${table}\` (${columnsDef.join(', ')})`);
        } else {
            const [columns]: any = await pool.query(`SHOW COLUMNS FROM \`${table}\``);
            const existingFields = columns.map((col: any) => col.Field);
            
            for (const key of Object.keys(schema)) {
                if (key === 'id') continue;
                if (!existingFields.includes(key)) {
                    const field = schema[key];
                    let dbType = 'VARCHAR(255)';
                    if (field.type === 'number') dbType = 'DOUBLE';
                    else if (field.type === 'boolean') dbType = 'TINYINT(1)';
                    else if (field.type === 'json') dbType = 'JSON';
                    else if (field.type === 'text') dbType = 'TEXT';
                    await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${key}\` ${dbType}`);
                }
            }
        }
    }

    async read(collection: string, query?: any, options?: any): Promise<any[]> {
        await this.ensureTable(collection, options?.schema);
        const pool = this.getPool();
        const hasSchema = !!options?.schema;

        let sql = `SELECT * FROM \`${collection}\``;
        const params: any[] = [];

        if (query && Object.keys(query).length > 0) {
            const conditions = Object.keys(query).map(key => {
                params.push(query[key]);
                if (key === 'id') {
                    return `\`id\` = ?`;
                }
                if (hasSchema) {
                    return `\`${key}\` = ?`;
                }
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
            if (hasSchema) {
                // Parse potential JSON column fields back to objects
                const schema = options.schema;
                const record = { ...row };
                Object.keys(schema).forEach(key => {
                    if (schema[key].type === 'json' && typeof record[key] === 'string') {
                        try {
                            record[key] = JSON.parse(record[key]);
                        } catch (e) {}
                    }
                });
                return record;
            }
            const parsedData = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
            return {
                id: row.id,
                ...parsedData,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt
            };
        });
    }

    async write(collection: string, data: any, options?: any): Promise<any> {
        await this.ensureTable(collection, options?.schema);
        const pool = this.getPool();
        const hasSchema = !!options?.schema;

        const id = data.id || `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
        const record = {
            ...data,
            id,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (hasSchema) {
            const schema = options.schema;
            const keys = Object.keys(record).map(k => `\`${k}\``);
            const placeholders = Object.keys(record).map(() => '?');
            const values = Object.keys(record).map(k => {
                const val = record[k];
                if (typeof val === 'object' && val !== null) {
                    return JSON.stringify(val);
                }
                return val;
            });

            const updateParts = Object.keys(record)
                .filter(k => k !== 'id' && k !== 'createdAt')
                .map(k => `\`${k}\` = VALUES(\`${k}\`)`);

            await pool.query(
                `INSERT INTO \`${collection}\` (${keys.join(', ')}) VALUES (${placeholders.join(', ')})
                 ON DUPLICATE KEY UPDATE ${updateParts.join(', ')}, \`updatedAt\` = VALUES(\`updatedAt\`)`,
                values
            );
            return record;
        }

        const { id: _, createdAt, updatedAt, ...rest } = record;
        await pool.query(
            `INSERT INTO \`${collection}\` (id, data, createdAt, updatedAt) VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE data = VALUES(data), updatedAt = VALUES(updatedAt)`,
            [id, JSON.stringify(rest), createdAt, updatedAt]
        );

        return record;
    }

    async update(collection: string, query: any, data: any, options?: any): Promise<boolean> {
        await this.ensureTable(collection, options?.schema);
        const pool = this.getPool();
        const hasSchema = !!options?.schema;

        if (hasSchema) {
            const setParts = Object.keys(data).map(k => `\`${k}\` = ?`);
            const setValues = Object.keys(data).map(k => {
                const val = data[k];
                if (typeof val === 'object' && val !== null) {
                    return JSON.stringify(val);
                }
                return val;
            });
            setParts.push('\`updatedAt\` = ?');
            setValues.push(new Date().toISOString());

            let sql = `UPDATE \`${collection}\` SET ${setParts.join(', ')}`;
            const params = [...setValues];

            if (query && Object.keys(query).length > 0) {
                const conditions = Object.keys(query).map(key => {
                    params.push(query[key]);
                    if (key === 'id') return `\`id\` = ?`;
                    return `\`${key}\` = ?`;
                });
                sql += ` WHERE ` + conditions.join(' AND ');
            }
            await pool.query(sql, params);
            return true;
        }

        // Retrieve existing records to merge update fields (fallback for JSON mode)
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

    async delete(collection: string, query: any, options?: any): Promise<boolean> {
        await this.ensureTable(collection, options?.schema);
        const pool = this.getPool();
        const hasSchema = !!options?.schema;

        let sql = `DELETE FROM \`${collection}\``;
        const params: any[] = [];

        if (query && Object.keys(query).length > 0) {
            const conditions = Object.keys(query).map(key => {
                params.push(query[key]);
                if (key === 'id') {
                    return `\`id\` = ?`;
                }
                if (hasSchema) {
                    return `\`${key}\` = ?`;
                }
                return `JSON_UNQUOTE(JSON_EXTRACT(data, '$.${key}')) = ?`;
            });
            sql += ` WHERE ` + conditions.join(' AND ');
            const [result] = await pool.query(sql, params);
            return (result as any).affectedRows > 0;
        } else {
            throw new Error('Delete query must specify filter parameters.');
        }
    }
}

export default MySqlDriver;


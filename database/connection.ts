import drivers from './drivers';
import DatabaseDriver from './DatabaseDriver';
import config from '../config';

class DatabaseConnection {
    private driverInstance?: DatabaseDriver;

    getDriver(): DatabaseDriver {
        if (!this.driverInstance) {
            const driverName = (process.env.DB_DRIVER || config.DB_DRIVER || 'DiskStorageDriver') as keyof typeof drivers;
            const DriverClass = drivers[driverName];
            if (!DriverClass) {
                throw new Error(`Unsupported database driver: ${driverName}`);
            }

            let driverConfig: any = {};
            if (driverName === 'DiskStorageDriver') {
                driverConfig = { dbDir: process.env.DB_DIR || config.DB_DIR || 'db_data' };
            } else if (driverName === 'MongoDbDriver') {
                driverConfig = {
                    uri: process.env.MONGO_URI || config.MONGO_URI,
                    dbName: process.env.MONGO_DB || config.MONGO_DB
                };
            } else if (driverName === 'MySqlDriver') {
                driverConfig = {
                    host: process.env.MYSQL_HOST || config.MYSQL_HOST,
                    user: process.env.MYSQL_USER || config.MYSQL_USER,
                    password: process.env.MYSQL_PASSWORD || config.MYSQL_PASSWORD,
                    database: process.env.MYSQL_DATABASE || config.MYSQL_DATABASE,
                    port: process.env.MYSQL_PORT || config.MYSQL_PORT
                };
            }

            this.driverInstance = new DriverClass(driverConfig);
        }
        return this.driverInstance!;
    }

    async connect(): Promise<void> {
        await this.getDriver().connect();
    }

    async disconnect(): Promise<void> {
        if (this.driverInstance) {
            await this.driverInstance.disconnect();
        }
    }
}

export const dbConnection = new DatabaseConnection();
export default dbConnection;

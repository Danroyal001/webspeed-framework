import { readFileSync, existsSync } from "fs";
import * as path from "path";
import dotenv from 'dotenv';

// Load standard .env file
dotenv.config();

// Load .local.env if it exists
const localEnvPath = path.resolve(process.cwd(), '.local.env');
if (existsSync(localEnvPath)) {
    try {
        const localConfig = dotenv.parse(readFileSync(localEnvPath));
        for (const key in localConfig) {
            process.env[key] = localConfig[key];
        }
    } catch (e) {
        console.error('Error loading .local.env file:', e);
    }
}

const env = {} as Record<string, any>;

if (process.env.WEBSPEED_ENV && typeof process.env.WEBSPEED_ENV == 'string') {
    try {
        const _env = JSON.parse(process.env.WEBSPEED_ENV) as Record<string, any>;
        Object.keys(_env).forEach((key: string) => {
            env[key] = _env[key];
        });
    } catch (error) {
        console.error('no webspeed-specific environment passed to current process');
    }
}

const envOptions = {
    ...env,
    ...process.env
} as Record<string, any>;

process.env.WEBSPEED_ENV = JSON.stringify(envOptions);

export default envOptions;

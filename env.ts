import { readFileSync } from "fs";
import TODO from './devKit/TODO';
import dotenv from 'dotenv';

// const env = JSON.parse(process.env.WEBSPEED_ENV as string) || JSON.parse(readFileSync('./.env.local').toString()) || JSON.parse(readFileSync('./.env').toString());

const env = {} as Record<string, any>;

if (process.env.WEBSPEED_ENV && typeof process.env.WEBSPEED_ENV == 'string') {
    try {
        const _env = JSON.parse(process.env.WEBSPEED_ENV) as Record<string, any>;
        Object.keys(_env).forEach((key: string) => {
            env[key] = _env[key];
        })
    } catch (error) {
        console.error('no webspeed-specific environment passed to current process');
    }
}
TODO('Also serialize env vars from .env files', __filename);

const envOptions = {
    ...env
} as Record<string, any>;

process.env.WEBSPEED_ENV = JSON.stringify(envOptions);

export default envOptions;

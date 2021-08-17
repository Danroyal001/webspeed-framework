import { readFileSync } from "fs";

const env = JSON.parse(process.env.WEBSPEED_ENV as string) || JSON.parse(readFileSync('./.env.local').toString()) || JSON.parse(readFileSync('./.env').toString());

const envOptions = {
    ...env
} as Record<string, any>;

process.env.WEBSPEED_ENV = JSON.stringify(envOptions);

export default envOptions;

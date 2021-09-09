import { readFileSync } from "fs";

const env = JSON.parse(process.env.WEBSPEED_ENV as string)
    ||
    JSON.parse(readFileSync('./.local.env').toString())
    ||
    JSON.parse(readFileSync('./.env').toString());


const envOptions = {
    ...env,
    ...process.env,
    WEBSPEED_ENV: null
} as Record<string, any>;


delete envOptions.WEBSPEED_ENV;
envOptions.WEBSPEED_ENV = null;
delete process.env.WEBSPEED_ENV;

process.env.WEBSPEED_ENV = JSON.stringify(envOptions);

export default envOptions;

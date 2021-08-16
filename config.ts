import envOptions from './env';
const config = {

    name: 'WebSpeed',
    PORT: 8080,

    ...envOptions

} as Record<string, any>;

export default config;

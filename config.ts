import envOptions from './env';
const config = {

    name: 'WebSpeed',
    version: '',
    PORT: 8080,

    ...envOptions

} as Record<string, any>;

export default config;

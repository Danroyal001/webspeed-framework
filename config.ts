import envOptions from './env';

const config = {

    name: 'WebSpeed',
    version: '',
    PORT: 8080,

    ...envOptions

} as Record<any, any>;

export default config;
